"""Parser angka format Indonesia. HARUS sama aturannya dengan frontend/src/utils/number.js.

    "216"     -> 216
    "4,5"     -> 4.5   (koma = desimal)
    "1.800"   -> 1800  (titik + kelompok 3 digit = ribuan)
    "12.000,5"-> 12000.5
    "4.5"     -> 4.5   (titik bukan kelompok 3 digit = desimal)
    lainnya   -> None
"""
from __future__ import annotations

import re

_THOUSANDS = re.compile(r"^-?\d{1,3}(\.\d{3})+(,\d+)?$")
_COMMA_DECIMAL = re.compile(r"^-?\d+(,\d+)?$")
_DOT_DECIMAL = re.compile(r"^-?\d+\.\d+$")


def parse_number(text: str | None) -> float | None:
    if text is None:
        return None
    s = str(text).strip()
    if not s:
        return None
    if _THOUSANDS.match(s):
        s = s.replace(".", "").replace(",", ".")
    elif _COMMA_DECIMAL.match(s):
        s = s.replace(",", ".")
    elif _DOT_DECIMAL.match(s):
        pass
    else:
        return None
    return float(s)


def format_number(value: float) -> str:
    """216 -> '216', 1800 -> '1.800', 4.5 -> '4,5'."""
    if float(value).is_integer():
        return f"{int(value):,}".replace(",", ".")
    whole, _, frac = f"{value:.6f}".rstrip("0").partition(".")
    whole_fmt = f"{int(whole):,}".replace(",", ".")
    return f"{whole_fmt},{frac}"
