"""
Scraper de concursos públicos — PCI Concursos (pciconcursos.com.br)

Estrutura real do site:
  div.ca              → card de cada concurso
  div.ca > a          → link (href) + título completo (atributo title)
  div.ca > div.cd     → "8.238 vagas até R$ 4.008,00 / Vários Cargos / Ensino Médio"
                        O R$ aqui é o SALÁRIO do cargo, não a taxa de inscrição.
  div.ca > div.ce > span → data de fim de inscrição (ex: "01/07/2026")

Segunda passagem (página de detalhe do PCI):
  - Extrai URL do portal da banca (link externo próximo a palavras de inscrição)
  - Extrai taxa de inscrição real via regex no texto da página

Estratégia: tenta requests + BeautifulSoup primeiro;
se falhar (JS blocking), usa Playwright headless como fallback.
Salva resultado em scraper/concursos_scraped.json
"""
from __future__ import annotations

import json
import re
import sys
import time
from datetime import datetime
from pathlib import Path
from urllib.parse import urljoin

import certifi
import requests
from bs4 import BeautifulSoup

PCI_BASE    = "https://www.pciconcursos.com.br"
LISTING_URL = f"{PCI_BASE}/concursos/"
OUTPUT      = Path(__file__).parent / "concursos_scraped.json"
HEADERS     = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0 Safari/537.36"
    ),
    "Accept-Language": "pt-BR,pt;q=0.9",
}

# Domínios a ignorar ao procurar link da banca
_IGNORAR = {
    "pciconcursos", "facebook", "twitter", "instagram",
    "youtube", "google", "whatsapp", "telegram", "linkedin", "tiktok",
}

# Palavras-chave que indicam proximidade com link de inscrição/banca
_KW_INSCRICAO = {
    "exclusivamente", "inscri", "banca", "portal", "acesse", "site do",
    "pelo site", "pelo portal", "pelo endere",
}


# ─── helpers ────────────────────────────────────────────────────────────────

def _parse_vagas(texto: str) -> int:
    texto = texto.replace(".", "")
    nums = re.findall(r"\d+", texto)
    return int(nums[0]) if nums else 0


def _parse_data(texto: str) -> str | None:
    try:
        return datetime.strptime(texto.strip(), "%d/%m/%Y").strftime("%Y-%m-%d")
    except ValueError:
        return None


def _parse_taxa(texto: str) -> str | None:
    """Extrai taxa de inscrição de texto livre. Ex: 'taxa de R$ 53,00' → '53.00'."""
    # Padrão 1: "taxa de inscrição ... R$ X"
    match = re.search(
        r"taxa de inscri[çc][aã]o[^R]{0,80}R\$\s*([\d.,]+)",
        texto, re.IGNORECASE
    )
    # Padrão 2: "inscrição ... R$ X"
    if not match:
        match = re.search(
            r"inscri[çc][aã]o[^R]{0,40}R\$\s*([\d.,]+)",
            texto, re.IGNORECASE
        )
    if not match:
        return None
    val = match.group(1).replace(".", "").replace(",", ".")
    try:
        f = float(val)
        # Sanidade: taxa de inscrição raramente passa de R$ 1.000
        return f"{f:.2f}" if 0 < f < 1000 else None
    except ValueError:
        return None


# ─── extração da listagem ────────────────────────────────────────────────────

def _extrair_de_soup(soup: BeautifulSoup) -> list[dict]:
    hoje = datetime.now().strftime("%Y-%m-%d")
    concursos: list[dict] = []

    for card in soup.select("div.ca"):
        link_el = card.find("a", href=True)
        if not link_el:
            continue

        href   = link_el.get("href", "")
        orgao  = link_el.get_text(strip=True)
        titulo = link_el.get("title", orgao)
        nome   = titulo if titulo else orgao
        if not nome:
            continue

        edital_url = urljoin(PCI_BASE, href) if href else None

        cd = card.select_one("div.cd")
        linhas = [l.strip() for l in cd.get_text("\n").split("\n") if l.strip()] if cd else []

        vagas = _parse_vagas(linhas[0]) if linhas else 0
        cargo = linhas[1] if len(linhas) > 1 else orgao

        ce       = card.select_one("div.ce span")
        data_fim = _parse_data(ce.get_text(strip=True)) if ce else None

        banca = orgao.split(" - ")[0] if " - " in orgao else orgao

        concursos.append({
            "nome": nome,
            "banca": banca,
            "cargo": cargo,
            "vagas": vagas,
            "dataInscricaoInicio": hoje,
            "dataInscricaoFim": data_fim or hoje,
            "dataProva": None,
            "valorInscricao": "0.00",   # taxa real vem da página de detalhe
            "descricao": nome,
            "edital": edital_url,
            "urlBanca": None,
            "status": "ativo",
        })

    return concursos


# ─── segunda passagem: detalhe do PCI ───────────────────────────────────────

def _buscar_detalhes(pci_url: str, session: requests.Session) -> tuple[str | None, str | None]:
    """
    Visita a página de detalhe do PCI e retorna (url_banca, taxa_inscricao).

    Estratégia para url_banca:
      Não compara com o nome da banca (o órgão do listing pode diferir da
      banca organizadora na página). Em vez disso, pontua links externos pelo
      contexto: palavras como "exclusivamente", "inscrições", "site do" ao
      redor do link indicam que é o portal da banca.
    """
    try:
        r = session.get(pci_url, headers=HEADERS, verify=certifi.where(), timeout=15)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "html.parser")

        # Taxa de inscrição
        taxa = _parse_taxa(soup.get_text(" "))

        # Link da banca: pontua links externos por proximidade a palavras-chave
        candidatos: list[tuple[int, str]] = []

        for a in soup.find_all("a", href=True):
            href  = a.get("href", "").strip()
            if not href.startswith("http"):
                continue
            if any(ign in href.lower() for ign in _IGNORAR):
                continue

            # Texto do elemento pai para avaliar contexto
            contexto = (a.parent.get_text(" ") if a.parent else "").lower()
            score = sum(1 for kw in _KW_INSCRICAO if kw in contexto)
            candidatos.append((score, href))

        url_banca = None
        if candidatos:
            candidatos.sort(key=lambda x: -x[0])
            # Só usa se tiver pelo menos 1 palavra-chave relevante no contexto
            if candidatos[0][0] > 0:
                url_banca = candidatos[0][1]

        return url_banca, taxa

    except Exception as e:
        print(f"  [detalhe] Erro em {pci_url}: {e}")
        return None, None


def _enriquecer(concursos: list[dict], session: requests.Session) -> None:
    """Segunda passagem: visita cada detalhe do PCI para URL da banca e taxa."""
    total = len(concursos)
    print(f"[Detalhe] Enriquecendo {total} concursos (banca + taxa)…")
    for i, c in enumerate(concursos, 1):
        edital = c.get("edital")
        if not edital:
            continue
        url_banca, taxa = _buscar_detalhes(edital, session)
        c["urlBanca"] = url_banca
        if taxa:
            c["valorInscricao"] = taxa

        banca_str = url_banca or "—"
        taxa_str  = f"R$ {taxa}" if taxa else "—"
        print(f"  [{i:>3}/{total}] {c['banca'][:30]:<30} | banca: {banca_str[:40]} | taxa: {taxa_str}")
        time.sleep(0.4)


# ─── estratégias de scraping ─────────────────────────────────────────────────

def raspar_com_bs4() -> list[dict]:
    print("[BS4] Requisitando PCI Concursos...")
    session = requests.Session()
    r = session.get(LISTING_URL, headers=HEADERS, verify=certifi.where(), timeout=30)
    r.raise_for_status()

    soup = BeautifulSoup(r.text, "html.parser")
    concursos = _extrair_de_soup(soup)
    if not concursos:
        raise ValueError("Nenhum concurso extraído — provável JS rendering")

    print(f"[BS4] {len(concursos)} concursos extraídos")
    _enriquecer(concursos, session)
    return concursos


def raspar_com_playwright() -> list[dict]:
    print("[Playwright] Iniciando navegador headless...")
    from playwright.sync_api import sync_playwright

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(extra_http_headers=HEADERS)
        page.goto(LISTING_URL, wait_until="networkidle", timeout=60_000)
        try:
            page.wait_for_selector("div.ca", timeout=10_000)
        except Exception:
            pass
        html = page.content()
        browser.close()

    soup = BeautifulSoup(html, "html.parser")
    concursos = _extrair_de_soup(soup)
    if not concursos:
        raise ValueError("Nenhum concurso extraído mesmo com JS")

    print(f"[Playwright] {len(concursos)} concursos extraídos")
    session = requests.Session()
    _enriquecer(concursos, session)
    return concursos


# ─── main ────────────────────────────────────────────────────────────────────

def salvar(concursos: list[dict]) -> None:
    payload = {
        "ultimaAtualizacao": datetime.now().isoformat(timespec="seconds"),
        "total": len(concursos),
        "concursos": concursos,
    }
    OUTPUT.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"[OK] Salvo em {OUTPUT} — {len(concursos)} concursos")


def main() -> None:
    try:
        concursos = raspar_com_bs4()
    except Exception as e:
        print(f"[BS4] Falhou: {e}")
        print("[Playwright] Tentando fallback headless...")
        try:
            concursos = raspar_com_playwright()
        except Exception as e2:
            print(f"[Playwright] Falhou: {e2}", file=sys.stderr)
            sys.exit(1)

    salvar(concursos)


if __name__ == "__main__":
    main()
