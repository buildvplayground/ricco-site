# -*- coding: utf-8 -*-
"""
Prepara os patterns de `_patterns/` para a paleta RICCO.

- fachada-janelas: grade de janelas com algumas acesas. Recolorida para
  filete navy + janela em ouro, e reenquadrada para 25x14 modulos exatos
  (600x336 a partir do offset 0.335), para poder repetir sem costura.
- grade-quadrada: stroke black -> navy da marca.
- overlays de luz: ficam como estao (sao gradientes preretos, usados como
  camada de sombra sobre a foto).
"""
import io, os, re

ROOT = os.path.dirname(os.path.abspath(__file__))
PAT = os.path.join(ROOT, "Site", "assets", "patterns")

# ------------------------------------------------------- fachada de janelas
p = os.path.join(PAT, "fachada-janelas.svg")
s = io.open(p, encoding="utf-8").read()

s = s.replace('stroke="#D1D5DC"', 'stroke="#1B3550"')   # filete da grade
s = s.replace('fill="#E5E7EB"',   'fill="#AE8857"')     # janela acesa

# reenquadra para 25 x 14 modulos de 24px, comecando no offset real do grid
s = re.sub(r'width="601" height="337" viewBox="0 0 601 337"',
           'width="600" height="336" viewBox="0.335 0.335 600 336"', s, count=1)

io.open(p, "w", encoding="utf-8").write(s)
print("fachada-janelas.svg: recolorida e reenquadrada 600x336 (25x14 modulos)")

# ----------------------------------------------------------- grade quadrada
p = os.path.join(PAT, "grade-quadrada.svg")
s = io.open(p, encoding="utf-8").read()
s = s.replace('stroke="black"', 'stroke="#17212B"')
io.open(p, "w", encoding="utf-8").write(s)
print("grade-quadrada.svg: stroke -> #17212B")

for f in sorted(os.listdir(PAT)):
    print("  %-26s %5d bytes" % (f, os.path.getsize(os.path.join(PAT, f))))
