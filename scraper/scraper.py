"""
Scraper de concursos públicos — PCI Concursos (pciconcursos.com.br)

Estrutura real do site:
  div.ca              → card de cada concurso
  div.ca > a          → link (href) + texto = nome do órgão, title = nome completo
  div.ca > div.cd     → "8.238 vagas até R$ 4.008,00 / Vários Cargos / Ensino Médio"
  div.ca > div.ce > span → data de inscrição (ex: "01/07/2026")

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

PCI_BASE     = "https://www.pciconcursos.com.br"
LISTING_URL  = f"{PCI_BASE}/concursos/"
OUTPUT       = Path(__file__).parent / "concursos_scraped.json"
HEADERS      = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0 Safari/537.36"
    ),
    "Accept-Language": "pt-BR,pt;q=0.9",
}


# ─── helpers ────────────────────────────────────────────────────────────────

def _parse_vagas(texto: str) -> int:
    """Extrai número de vagas de '8.238 vagas até R$ 4.008,00'."""
    texto = texto.replace(".", "")
    nums = re.findall(r"\d+", texto)
    return int(nums[0]) if nums else 0


def _parse_valor(texto: str) -> str:
    """Extrai valor de 'até R$ 4.008,00' → '4008.00'."""
    match = re.search(r"R\$\s*([\d.,]+)", texto)
    if not match:
        return "0.00"
    val = match.group(1).replace(".", "").replace(",", ".")
    try:
        return f"{float(val):.2f}"
    except ValueError:
        return "0.00"


def _parse_data(texto: str) -> str | None:
    """Converte '01/07/2026' → '2026-07-01'."""
    texto = texto.strip()
    try:
        return datetime.strptime(texto, "%d/%m/%Y").strftime("%Y-%m-%d")
    except ValueError:
        return None


def _extrair_de_soup(soup: BeautifulSoup) -> list[dict]:
    """Extrai todos os concursos da página usando os seletores reais do PCI."""
    hoje = datetime.now().strftime("%Y-%m-%d")
    concursos: list[dict] = []

    for card in soup.select("div.ca"):
        link_el = card.find("a", href=True)
        if not link_el:
            continue

        href  = link_el.get("href", "")
        orgao = link_el.get_text(strip=True)
        titulo = link_el.get("title", orgao)
        nome  = titulo if titulo else orgao
        if not nome:
            continue

        # Garante URL absoluta
        edital_url = urljoin(PCI_BASE, href) if href else None

        # div.cd: "8.238 vagas até R$ 4.008,00 \n Vários Cargos \n Ensino Médio"
        cd = card.select_one("div.cd")
        linhas = [l.strip() for l in cd.get_text("\n").split("\n") if l.strip()] if cd else []

        vagas = _parse_vagas(linhas[0]) if linhas else 0
        valor = _parse_valor(linhas[0]) if linhas else "0.00"
        cargo = linhas[1] if len(linhas) > 1 else orgao

        # div.ce > span: data de fim de inscrição
        ce = card.select_one("div.ce span")
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
            "valorInscricao": valor,
            "descricao": nome,
            "edital": edital_url,
            "urlBanca": None,
            "status": "ativo",
        })

    return concursos


def _buscar_url_banca(pci_url: str, banca: str, session: requests.Session) -> str | None:
    """
    Visita a página de detalhe do concurso no PCI e extrai o link
    para o portal da banca organizadora (link externo destacado em azul).
    """
    try:
        r = session.get(pci_url, headers=HEADERS, verify=certifi.where(), timeout=15)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "html.parser")

        banca_lower = banca.lower().strip()

        for a in soup.find_all("a", href=True):
            href = a.get("href", "").strip()
            texto = a.get_text(strip=True).lower()

            # Só links externos (não PCI)
            if not href.startswith("http"):
                continue
            if "pciconcursos" in href.lower():
                continue
            # Link cujo texto contém ou está contido no nome da banca
            if banca_lower in texto or texto in banca_lower:
                return href

        return None
    except Exception as e:
        print(f"  [urlBanca] Erro em {pci_url}: {e}")
        return None


def _enriquecer_bancas(concursos: list[dict], session: requests.Session) -> None:
    """Segunda passagem: visita cada detalhe do PCI para capturar o link da banca."""
    total = len(concursos)
    print(f"[Bancas] Buscando links das bancas para {total} concursos…")
    for i, c in enumerate(concursos, 1):
        edital = c.get("edital")
        if not edital:
            continue
        url = _buscar_url_banca(edital, c["banca"], session)
        c["urlBanca"] = url
        status = url if url else "não encontrado"
        print(f"  [{i}/{total}] {c['banca']}: {status}")
        time.sleep(0.3)  # respeita o servidor


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
    _enriquecer_bancas(concursos, session)
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
    _enriquecer_bancas(concursos, session)
    return concursos


# ─── main ─────────────────────────────────────────────────────────────────────

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
