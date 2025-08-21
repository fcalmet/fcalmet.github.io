/*
  Copyright (C) 2025 by Fernando Calmet

  Author: Fernando Calmet

  This program is free software; you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

function setResult(html = '') {
  document.getElementById('result').innerHTML = html;
}

/****************/
/** AIP type 1 **/
/****************/

function getAip(p, d, s, ooi1, ooi2, h1, h2, rt) {
  const definitive1 = (h1 == 1 && p >= 1)
		|| (p == 1 && (s >= 1 || ooi1 >= 1 || h1 >= 1))
		|| (p == 2 && ((d >= 2 ? 1 : 0) + (s == 1 ? 1 : 0) + (ooi1 == 1 ? 1 : 0) >= 2))
		|| (rt == 1 && p == 2 && ((s == 1 || ooi1 == 1) || (d == 1 && (s == 2 || ooi1 == 2 || h1 == 2))));
  const probable1 = !definitive1 && p == 2 && (s == 2 || ooi1 == 2 || h1 == 2) && rt == 1;
  const definitive2 = p >= 1 && (h2 == 1 || (ooi2 == 2 && h2 == 2 && rt == 1));
  const probable2 = !definitive2 && (h2 == 2 || ooi2 == 2) && rt == 1;
  const nos = !definitive1 && !probable1 && !definitive2 && !probable2 && p >= 1 && d >= 1 && rt == 1;
  return {
	p: p, d: d, s: s, ooi1: ooi1, ooi2: ooi2, h1: h1, h2: h2, rt: rt,
	definitive1: definitive1, probable1: probable1, definitive2: definitive2, probable2: probable2, nos: nos
  }
}

function getAipInterpretation(aip) {
  return `<ul>
	  <li>${aip.definitive1 ? "Definitive" : aip.probable1 ? "Probable" : "Criteria not met for"} type 1 AIP
		<ul>
          ${aip.p > 0 ? "<li>Parenchymal imaging (P) level " + aip.p + "</li>" : ""}
          ${aip.d > 0 ? "<li>Ductal imaging (D) level " + aip.d + "</li>" : ""}
          ${aip.s > 0 ? "<li>Serology (S) level " + aip.s + "</li>" : ""}
          ${aip.ooi1 > 0 ? "<li>Other organ involvement (OOI) level " + aip.ooi1 + "</li>" : ""}
          ${aip.h1 > 0 ? "<li>Histology of the pancreas (H) level " + aip.h1 + "</li>" : ""}
          ${aip.rt > 0 ? "<li>Response to steroid (Rt)</li>" : ""}
        </ul>
	  </li>
	  <li>${aip.definitive2 ? "Definitive" : aip.probable2 ? "Probable" : "Criteria not met for"} type 2 AIP
		<ul>
          ${aip.p > 0 ? "<li>Parenchymal imaging (P) level " + aip.p + "</li>" : ""}
          ${aip.d > 0 ? "<li>Ductal imaging (D) level " + aip.d + "</li>" : ""}
          ${aip.ooi2 > 0 ? "<li>Other organ involvement (OOI) level " + aip.ooi2 + "</li>" : ""}
          ${aip.h2 > 0 ? "<li>Histology of the pancreas (H) level " + aip.h2 + "</li>" : ""}
          ${aip.rt > 0 ? "<li>Response to steroid (Rt)</li>" : ""}
        </ul>
	  </li>
      ${aip.nos ? "<li>AIP—Not otherwise specified<ul>" +
          (aip.p > 0 ? "<li>Parenchymal imaging (P) level " + aip.p + "</li>" : "") +
          (aip.d > 0 ? "<li>Ductal imaging (D) level " + aip.d + "</li>" : "") +
          (aip.rt > 0 ? "<li>Response to steroid (Rt)</li>" : "") +
          "</ul></li>" : ""}
	</ul>`
}

function calculateAip() {
  const p = document.querySelector('input[name="aip-p"]:checked').value;
  const d = document.querySelector('input[name="aip-d"]:checked').value;
  const s = document.querySelector('input[name="aip-s"]:checked').value;
  const ooi1 = document.querySelector('input[name="aip-ooi1"]:checked').value;
  const ooi2 = document.querySelector('input[name="aip-ooi2"]:checked').value;
  const h1 = document.querySelector('input[name="aip-h1"]:checked').value;
  const h2 = document.querySelector('input[name="aip-h2"]:checked').value;
  const rt = document.querySelector('input[name="aip-rt"]:checked').value;
  const aip = getAip(p, d, s, ooi1, ooi2, h1, h2, rt)
  const interpretation = getAipInterpretation(aip)
  setResult(interpretation)
}
