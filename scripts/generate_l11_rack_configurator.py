from __future__ import annotations

import argparse
from datetime import datetime, timezone
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

DEFAULT_OUTPUT_PATH = Path("artifacts/L11_Rack_Configurator.xlsm")


def build_sheet_xml() -> str:
    rows = []

    def cell(ref: str, value: str, *, t: str | None = None, style: int | None = None, formula: str | None = None) -> str:
        attrs = [f'r="{ref}"']
        if t:
            attrs.append(f't="{t}"')
        if style is not None:
            attrs.append(f's="{style}"')
        if formula is not None:
            return f"<c {' '.join(attrs)}><f>{formula}</f><v>{value}</v></c>"
        if t == "inlineStr":
            return f"<c {' '.join(attrs)}><is><t>{value}</t></is></c>"
        return f"<c {' '.join(attrs)}><v>{value}</v></c>"

    # Title and summary rows
    rows.append('<row r="1"><c r="A1" t="inlineStr" s="1"><is><t>L11 Rack Configurator (45RU)</t></is></c></row>')
    rows.append('<row r="2"><c r="A2" t="inlineStr" s="2"><is><t>Total Rack Units</t></is></c><c r="B2"><v>45</v></c></row>')
    rows.append('<row r="3"><c r="A3" t="inlineStr" s="2"><is><t>Used Rack Units</t></is></c><c r="B3"><f>SUM(C6:C50)</f><v>0</v></c></row>')
    rows.append('<row r="4"><c r="A4" t="inlineStr" s="2"><is><t>Remaining Rack Units</t></is></c><c r="B4"><f>B2-B3</f><v>45</v></c></row>')
    rows.append('<row r="5"><c r="A5" t="inlineStr" s="2"><is><t>Status</t></is></c><c r="B5"><f>IF(B3&gt;B2,"OVER CAPACITY","OK")</f><v>0</v></c></row>')

    # Header row
    rows.append(
        '<row r="6">'
        '<c r="A6" t="inlineStr" s="3"><is><t>Rack Position (RU)</t></is></c>'
        '<c r="B6" t="inlineStr" s="3"><is><t>Equipment Selection</t></is></c>'
        '<c r="C6" t="inlineStr" s="3"><is><t>Height (U)</t></is></c>'
        '<c r="D6" t="inlineStr" s="3"><is><t>Notes</t></is></c>'
        '</row>'
    )

    # Rack rows (45RU descending)
    excel_row = 7
    for ru in range(45, 0, -1):
        formula = f'IF(B{excel_row}="1U Server",1,IF(B{excel_row}="2U Server",2,IF(B{excel_row}="4U Server",4,0)))'
        rows.append(
            f'<row r="{excel_row}">'
            + cell(f"A{excel_row}", str(ru), style=4)
            + cell(f"B{excel_row}", "Empty", t="inlineStr")
            + cell(f"C{excel_row}", "0", formula=formula)
            + cell(f"D{excel_row}", "")
            + '</row>'
        )
        excel_row += 1

    data_validations = (
        '<dataValidations count="1">'
        '<dataValidation type="list" allowBlank="1" showDropDown="0" sqref="B7:B51">'
        '<formula1>"Empty,1U Server,2U Server,4U Server"</formula1>'
        '</dataValidation>'
        '</dataValidations>'
    )

    return "".join(
        [
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
            '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ',
            'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">',
            '<sheetViews><sheetView workbookViewId="0"/></sheetViews>',
            '<sheetFormatPr defaultRowHeight="15"/>',
            '<cols><col min="1" max="1" width="20" customWidth="1"/><col min="2" max="2" width="28" customWidth="1"/><col min="3" max="3" width="14" customWidth="1"/><col min="4" max="4" width="34" customWidth="1"/></cols>',
            '<sheetData>',
            "".join(rows),
            "</sheetData>",
            '<autoFilter ref="A6:D51"/>',
            data_validations,
            '<pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/>',
            "</worksheet>",
        ]
    )


def build_styles_xml() -> str:
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        '<fonts count="2">'
        '<font><sz val="11"/><name val="Calibri"/></font>'
        '<font><b/><sz val="11"/><name val="Calibri"/></font>'
        '</fonts>'
        '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>'
        '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>'
        '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
        '<cellXfs count="5">'
        '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'
        '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>'
        '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>'
        '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>'
        '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'
        '</cellXfs>'
        '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>'
        '</styleSheet>'
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate the L11 45RU rack configurator workbook."
    )
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT_PATH,
        help="Destination path for the generated .xlsm file.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    output_path: Path = args.output
    output_path.parent.mkdir(parents=True, exist_ok=True)
    created = datetime.now(timezone.utc).replace(microsecond=0).isoformat()

    content_types = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.ms-excel.sheet.macroEnabled.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>'''

    rels = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>'''

    workbook = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <bookViews><workbookView xWindow="0" yWindow="0" windowWidth="24000" windowHeight="12000"/></bookViews>
  <sheets><sheet name="Rack Configurator" sheetId="1" r:id="rId1"/></sheets>
</workbook>'''

    workbook_rels = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/>
</Relationships>'''

    app = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Microsoft Excel</Application>
  <DocSecurity>0</DocSecurity>
  <ScaleCrop>false</ScaleCrop>
  <HeadingPairs><vt:vector size="2" baseType="variant"><vt:variant><vt:lpstr>Worksheets</vt:lpstr></vt:variant><vt:variant><vt:i4>1</vt:i4></vt:variant></vt:vector></HeadingPairs>
  <TitlesOfParts><vt:vector size="1" baseType="lpstr"><vt:lpstr>Rack Configurator</vt:lpstr></vt:vector></TitlesOfParts>
</Properties>'''

    core = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:creator>Codex</dc:creator>
  <cp:lastModifiedBy>Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">{created}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">{created}</dcterms:modified>
  <dc:title>L11 Rack Configurator</dc:title>
</cp:coreProperties>'''

    theme = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office Theme">
  <a:themeElements>
    <a:clrScheme name="Office"><a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1><a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="1F497D"/></a:dk2><a:lt2><a:srgbClr val="EEECE1"/></a:lt2><a:accent1><a:srgbClr val="4F81BD"/></a:accent1><a:accent2><a:srgbClr val="C0504D"/></a:accent2><a:accent3><a:srgbClr val="9BBB59"/></a:accent3><a:accent4><a:srgbClr val="8064A2"/></a:accent4><a:accent5><a:srgbClr val="4BACC6"/></a:accent5><a:accent6><a:srgbClr val="F79646"/></a:accent6><a:hlink><a:srgbClr val="0000FF"/></a:hlink><a:folHlink><a:srgbClr val="800080"/></a:folHlink></a:clrScheme>
    <a:fontScheme name="Office"><a:majorFont><a:latin typeface="Calibri"/></a:majorFont><a:minorFont><a:latin typeface="Calibri"/></a:minorFont></a:fontScheme>
    <a:fmtScheme name="Office"><a:fillStyleLst/><a:lnStyleLst/><a:effectStyleLst/><a:bgFillStyleLst/></a:fmtScheme>
  </a:themeElements>
</a:theme>'''

    with ZipFile(output_path, "w", compression=ZIP_DEFLATED) as zf:
        zf.writestr("[Content_Types].xml", content_types)
        zf.writestr("_rels/.rels", rels)
        zf.writestr("docProps/app.xml", app)
        zf.writestr("docProps/core.xml", core)
        zf.writestr("xl/workbook.xml", workbook)
        zf.writestr("xl/_rels/workbook.xml.rels", workbook_rels)
        zf.writestr("xl/worksheets/sheet1.xml", build_sheet_xml())
        zf.writestr("xl/styles.xml", build_styles_xml())
        zf.writestr("xl/theme/theme1.xml", theme)

    print(f"Created {output_path}")


if __name__ == "__main__":
    main()
