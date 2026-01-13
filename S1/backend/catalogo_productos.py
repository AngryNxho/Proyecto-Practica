"""
Catálogo completo de productos para inventario de consumibles de impresión
Todos los productos con stock=0 para ser catálogo base
"""

CATALOGO_PRODUCTOS = [
    # ==================== IMPRESORAS LÁSER MONOCROMÁTICAS ====================
    {'nombre': 'HP LaserJet Pro M404dn', 'marca': 'HP', 'modelo': 'M404dn', 'categoria': 'Impresora', 'stock': 0, 'precio': 285000, 'descripcion': 'Láser mono 38ppm dúplex red', 'codigo_barras': '0193015564251'},
    {'nombre': 'HP LaserJet Pro M402n', 'marca': 'HP', 'modelo': 'M402n', 'categoria': 'Impresora', 'stock': 0, 'precio': 245000, 'descripcion': 'Láser mono 40ppm red', 'codigo_barras': '0190781565758'},
    {'nombre': 'Brother HL-L2350DW', 'marca': 'Brother', 'modelo': 'HL-L2350DW', 'categoria': 'Impresora', 'stock': 0, 'precio': 165000, 'descripcion': 'Láser mono 32ppm WiFi', 'codigo_barras': '4977766761357'},
    {'nombre': 'Brother DCP-L2540DW', 'marca': 'Brother', 'modelo': 'DCP-L2540DW', 'categoria': 'Impresora', 'stock': 0, 'precio': 175000, 'descripcion': 'Multif láser mono WiFi', 'codigo_barras': '4977766711203'},
    {'nombre': 'Canon imageCLASS MF445dw', 'marca': 'Canon', 'modelo': 'MF445dw', 'categoria': 'Impresora', 'stock': 0, 'precio': 295000, 'descripcion': 'Multif láser mono WiFi dúplex', 'codigo_barras': '4549292088410'},
    {'nombre': 'Canon imageCLASS LBP226dw', 'marca': 'Canon', 'modelo': 'LBP226dw', 'categoria': 'Impresora', 'stock': 0, 'precio': 225000, 'descripcion': 'Láser mono 40ppm WiFi', 'codigo_barras': '4549292094480'},
    {'nombre': 'Samsung Xpress M2020W', 'marca': 'Samsung', 'modelo': 'M2020W', 'categoria': 'Impresora', 'stock': 0, 'precio': 145000, 'descripcion': 'Láser mono WiFi compacta', 'codigo_barras': '8806086206914'},
    {'nombre': 'Samsung Xpress M2070W', 'marca': 'Samsung', 'modelo': 'M2070W', 'categoria': 'Impresora', 'stock': 0, 'precio': 185000, 'descripcion': 'Multif láser mono WiFi', 'codigo_barras': '8806086206921'},
    {'nombre': 'Xerox Phaser 3020', 'marca': 'Xerox', 'modelo': 'Phaser 3020', 'categoria': 'Impresora', 'stock': 0, 'precio': 155000, 'descripcion': 'Láser mono WiFi 20ppm', 'codigo_barras': '0095205859010'},
    {'nombre': 'Lexmark MS331dn', 'marca': 'Lexmark', 'modelo': 'MS331dn', 'categoria': 'Impresora', 'stock': 0, 'precio': 165000, 'descripcion': 'Láser mono dúplex 40ppm', 'codigo_barras': '0734646639927'},
    {'nombre': 'Ricoh SP 230DNw', 'marca': 'Ricoh', 'modelo': 'SP 230DNw', 'categoria': 'Impresora', 'stock': 0, 'precio': 180000, 'descripcion': 'Láser mono dúplex WiFi', 'codigo_barras': '4961311919450'},
    {'nombre': 'Kyocera ECOSYS P2040dn', 'marca': 'Kyocera', 'modelo': 'P2040dn', 'categoria': 'Impresora', 'stock': 0, 'precio': 195000, 'descripcion': 'Láser mono dúplex 40ppm', 'codigo_barras': '0632983034934'},
    {'nombre': 'OKI B412dn', 'marca': 'OKI', 'modelo': 'B412dn', 'categoria': 'Impresora', 'stock': 0, 'precio': 185000, 'descripcion': 'Láser mono dúplex 33ppm', 'codigo_barras': '5031713058281'},
    
    # ==================== IMPRESORAS LÁSER COLOR ====================
    {'nombre': 'HP Color LaserJet Pro M255dw', 'marca': 'HP', 'modelo': 'M255dw', 'categoria': 'Impresora', 'stock': 0, 'precio': 325000, 'descripcion': 'Láser color WiFi dúplex 21ppm', 'codigo_barras': '0196068023530'},
    {'nombre': 'HP Color LaserJet Pro MFP M283fdw', 'marca': 'HP', 'modelo': 'M283fdw', 'categoria': 'Impresora', 'stock': 0, 'precio': 385000, 'descripcion': 'Multif láser color WiFi fax', 'codigo_barras': '0193015853157'},
    {'nombre': 'Brother HL-L3290CDW', 'marca': 'Brother', 'modelo': 'HL-L3290CDW', 'categoria': 'Impresora', 'stock': 0, 'precio': 295000, 'descripcion': 'Láser color WiFi dúplex', 'codigo_barras': '4977766794695'},
    {'nombre': 'Canon imageCLASS MF644Cdw', 'marca': 'Canon', 'modelo': 'MF644Cdw', 'categoria': 'Impresora', 'stock': 0, 'precio': 425000, 'descripcion': 'Multif láser color WiFi', 'codigo_barras': '4549292088427'},
    
    # ==================== IMPRESORAS DE INYECCIÓN TINTA ====================
    {'nombre': 'Canon Pixma G3110', 'marca': 'Canon', 'modelo': 'G3110', 'categoria': 'Impresora', 'stock': 0, 'precio': 195000, 'descripcion': 'Multif tinta continua WiFi', 'codigo_barras': '4549292077254'},
    {'nombre': 'Canon Pixma G4110', 'marca': 'Canon', 'modelo': 'G4110', 'categoria': 'Impresora', 'stock': 0, 'precio': 235000, 'descripcion': 'Multif tinta continua WiFi fax', 'codigo_barras': '4549292077261'},
    {'nombre': 'Canon Pixma G5010', 'marca': 'Canon', 'modelo': 'G5010', 'categoria': 'Impresora', 'stock': 0, 'precio': 245000, 'descripcion': 'Impresora tinta continua', 'codigo_barras': '4549292077278'},
    {'nombre': 'Epson EcoTank L3250', 'marca': 'Epson', 'modelo': 'L3250', 'categoria': 'Impresora', 'stock': 0, 'precio': 220000, 'descripcion': 'Multif tanque tinta WiFi', 'codigo_barras': '0010343943964'},
    {'nombre': 'Epson EcoTank L3210', 'marca': 'Epson', 'modelo': 'L3210', 'categoria': 'Impresora', 'stock': 0, 'precio': 195000, 'descripcion': 'Multif tanque tinta USB', 'codigo_barras': '0010343943957'},
    {'nombre': 'Epson EcoTank L5290', 'marca': 'Epson', 'modelo': 'L5290', 'categoria': 'Impresora', 'stock': 0, 'precio': 285000, 'descripcion': 'Multif tanque tinta WiFi fax', 'codigo_barras': '0010343943971'},
    {'nombre': 'HP Smart Tank 750', 'marca': 'HP', 'modelo': 'Smart Tank 750', 'categoria': 'Impresora', 'stock': 0, 'precio': 245000, 'descripcion': 'Multif tanque tinta WiFi', 'codigo_barras': '0194850099471'},
    
    # ==================== TÓNERS HP NEGRO ====================
    {'nombre': 'Tóner HP 26A Negro', 'marca': 'HP', 'modelo': 'CF226A', 'categoria': 'Toner', 'stock': 0, 'precio': 58000, 'descripcion': 'Negro 3100 pág M402/M426', 'codigo_barras': '0889899821343'},
    {'nombre': 'Tóner HP 58A Negro', 'marca': 'HP', 'modelo': 'CF258A', 'categoria': 'Toner', 'stock': 0, 'precio': 48000, 'descripcion': 'Negro 3000 pág M404/M428', 'codigo_barras': '0190781094753'},
    {'nombre': 'Tóner HP 59A Negro', 'marca': 'HP', 'modelo': 'CF259A', 'categoria': 'Toner', 'stock': 0, 'precio': 55000, 'descripcion': 'Negro 3000 pág M404/M428', 'codigo_barras': '0190781094760'},
    {'nombre': 'Tóner HP 90A Negro', 'marca': 'HP', 'modelo': 'CE390A', 'categoria': 'Toner', 'stock': 0, 'precio': 85000, 'descripcion': 'Negro 10000 pág M4555', 'codigo_barras': '0886112847654'},
    
    # ==================== TÓNERS HP COLOR ====================
    {'nombre': 'Tóner HP 414A Negro', 'marca': 'HP', 'modelo': 'W2020A', 'categoria': 'Toner', 'stock': 0, 'precio': 48000, 'descripcion': 'Negro 2400 pág M454/M479', 'codigo_barras': '0193015564046'},
    {'nombre': 'Tóner HP 414A Cyan', 'marca': 'HP', 'modelo': 'W2021A', 'categoria': 'Toner', 'stock': 0, 'precio': 62000, 'descripcion': 'Cyan 2100 pág M454/M479', 'codigo_barras': '0193015564053'},
    {'nombre': 'Tóner HP 414A Magenta', 'marca': 'HP', 'modelo': 'W2023A', 'categoria': 'Toner', 'stock': 0, 'precio': 62000, 'descripcion': 'Magenta 2100 pág M454/M479', 'codigo_barras': '0193015564077'},
    {'nombre': 'Tóner HP 414A Amarillo', 'marca': 'HP', 'modelo': 'W2022A', 'categoria': 'Toner', 'stock': 0, 'precio': 62000, 'descripcion': 'Amarillo 2100 pág M454/M479', 'codigo_barras': '0193015564060'},
    {'nombre': 'Tóner HP 206A Negro', 'marca': 'HP', 'modelo': 'W2110A', 'categoria': 'Toner', 'stock': 0, 'precio': 52000, 'descripcion': 'Negro 1350 pág M255/M282', 'codigo_barras': '0196068023387'},
    {'nombre': 'Tóner HP 206A Cyan', 'marca': 'HP', 'modelo': 'W2111A', 'categoria': 'Toner', 'stock': 0, 'precio': 68000, 'descripcion': 'Cyan 1250 pág M255/M282', 'codigo_barras': '0196068023394'},
    {'nombre': 'Tóner HP 206A Magenta', 'marca': 'HP', 'modelo': 'W2113A', 'categoria': 'Toner', 'stock': 0, 'precio': 68000, 'descripcion': 'Magenta 1250 pág M255/M282', 'codigo_barras': '0196068023417'},
    {'nombre': 'Tóner HP 206A Amarillo', 'marca': 'HP', 'modelo': 'W2112A', 'categoria': 'Toner', 'stock': 0, 'precio': 68000, 'descripcion': 'Amarillo 1250 pág M255/M282', 'codigo_barras': '0196068023400'},
    
    # ==================== TÓNERS BROTHER NEGRO ====================
    {'nombre': 'Tóner Brother TN-760', 'marca': 'Brother', 'modelo': 'TN-760', 'categoria': 'Toner', 'stock': 0, 'precio': 52000, 'descripcion': 'Negro 3000 pág HL-L2350DW', 'codigo_barras': '4977766798952'},
    {'nombre': 'Tóner Brother TN-730', 'marca': 'Brother', 'modelo': 'TN-730', 'categoria': 'Toner', 'stock': 0, 'precio': 42000, 'descripcion': 'Negro 1200 pág HL-L2350DW', 'codigo_barras': '4977766798945'},
    {'nombre': 'Tóner Brother TN-2370', 'marca': 'Brother', 'modelo': 'TN-2370', 'categoria': 'Toner', 'stock': 0, 'precio': 46000, 'descripcion': 'Negro 2600 pág HL-L2395DW', 'codigo_barras': '4977766753654'},
    {'nombre': 'Tóner Brother TN-2420', 'marca': 'Brother', 'modelo': 'TN-2420', 'categoria': 'Toner', 'stock': 0, 'precio': 48000, 'descripcion': 'Negro 3000 pág HL-L2350DW', 'codigo_barras': '4977766765046'},
    
    # ==================== TÓNERS BROTHER COLOR ====================
    {'nombre': 'Tóner Brother TN-227BK Negro', 'marca': 'Brother', 'modelo': 'TN-227BK', 'categoria': 'Toner', 'stock': 0, 'precio': 55000, 'descripcion': 'Negro 3000 pág HL-L3290CDW', 'codigo_barras': '4977766800914'},
    {'nombre': 'Tóner Brother TN-227C Cyan', 'marca': 'Brother', 'modelo': 'TN-227C', 'categoria': 'Toner', 'stock': 0, 'precio': 70000, 'descripcion': 'Cyan 2300 pág HL-L3290CDW', 'codigo_barras': '4977766800921'},
    {'nombre': 'Tóner Brother TN-227M Magenta', 'marca': 'Brother', 'modelo': 'TN-227M', 'categoria': 'Toner', 'stock': 0, 'precio': 70000, 'descripcion': 'Magenta 2300 pág HL-L3290CDW', 'codigo_barras': '4977766800938'},
    {'nombre': 'Tóner Brother TN-227Y Amarillo', 'marca': 'Brother', 'modelo': 'TN-227Y', 'categoria': 'Toner', 'stock': 0, 'precio': 70000, 'descripcion': 'Amarillo 2300 pág HL-L3290CDW', 'codigo_barras': '4977766800945'},
    
    # ==================== TÓNERS CANON NEGRO ====================
    {'nombre': 'Tóner Canon 046 Negro', 'marca': 'Canon', 'modelo': '046BK', 'categoria': 'Toner', 'stock': 0, 'precio': 45000, 'descripcion': 'Negro 2200 pág MF735Cx', 'codigo_barras': '4549292066524'},
    {'nombre': 'Tóner Canon 046H Negro', 'marca': 'Canon', 'modelo': '046HBK', 'categoria': 'Toner', 'stock': 0, 'precio': 65000, 'descripcion': 'Negro 6300 pág MF735Cx', 'codigo_barras': '4549292066548'},
    {'nombre': 'Tóner Canon 137 Negro', 'marca': 'Canon', 'modelo': 'CRG-137', 'categoria': 'Toner', 'stock': 0, 'precio': 48000, 'descripcion': 'Negro 2400 pág MF212w', 'codigo_barras': '0013803188561'},
    
    # ==================== TÓNERS CANON COLOR ====================
    {'nombre': 'Tóner Canon 046 Cyan', 'marca': 'Canon', 'modelo': '046C', 'categoria': 'Toner', 'stock': 0, 'precio': 58000, 'descripcion': 'Cyan 2300 pág MF735Cx', 'codigo_barras': '4549292066531'},
    {'nombre': 'Tóner Canon 046 Magenta', 'marca': 'Canon', 'modelo': '046M', 'categoria': 'Toner', 'stock': 0, 'precio': 58000, 'descripcion': 'Magenta 2300 pág MF735Cx', 'codigo_barras': '4549292066555'},
    {'nombre': 'Tóner Canon 046 Amarillo', 'marca': 'Canon', 'modelo': '046Y', 'categoria': 'Toner', 'stock': 0, 'precio': 58000, 'descripcion': 'Amarillo 2300 pág MF735Cx', 'codigo_barras': '4549292066562'},
    {'nombre': 'Tóner Canon 046H Cyan', 'marca': 'Canon', 'modelo': '046HC', 'categoria': 'Toner', 'stock': 0, 'precio': 78000, 'descripcion': 'Cyan 5000 pág MF735Cx', 'codigo_barras': '4549292066579'},
    {'nombre': 'Tóner Canon 046H Magenta', 'marca': 'Canon', 'modelo': '046HM', 'categoria': 'Toner', 'stock': 0, 'precio': 78000, 'descripcion': 'Magenta 5000 pág MF735Cx', 'codigo_barras': '4549292066586'},
    {'nombre': 'Tóner Canon 046H Amarillo', 'marca': 'Canon', 'modelo': '046HY', 'categoria': 'Toner', 'stock': 0, 'precio': 78000, 'descripcion': 'Amarillo 5000 pág MF735Cx', 'codigo_barras': '4549292066593'},
    
    # ==================== TÓNERS SAMSUNG ====================
    {'nombre': 'Tóner Samsung MLT-D101S', 'marca': 'Samsung', 'modelo': 'MLT-D101S', 'categoria': 'Toner', 'stock': 0, 'precio': 38000, 'descripcion': 'Negro 1500 pág ML-2165', 'codigo_barras': '8808993469888'},
    {'nombre': 'Tóner Samsung MLT-D111S', 'marca': 'Samsung', 'modelo': 'MLT-D111S', 'categoria': 'Toner', 'stock': 0, 'precio': 42000, 'descripcion': 'Negro 1000 pág M2020W', 'codigo_barras': '8808993577095'},
    {'nombre': 'Tóner Samsung MLT-D203L', 'marca': 'Samsung', 'modelo': 'MLT-D203L', 'categoria': 'Toner', 'stock': 0, 'precio': 58000, 'descripcion': 'Negro 5000 pág M3820', 'codigo_barras': '8806088457291'},
    
    # ==================== TINTAS EPSON ====================
    {'nombre': 'Tinta Epson 544 Negro', 'marca': 'Epson', 'modelo': 'T544120', 'categoria': 'Tinta', 'stock': 0, 'precio': 12000, 'descripcion': 'Negro 65ml EcoTank L3210', 'codigo_barras': '0010343943995'},
    {'nombre': 'Tinta Epson 544 Cyan', 'marca': 'Epson', 'modelo': 'T544220', 'categoria': 'Tinta', 'stock': 0, 'precio': 12000, 'descripcion': 'Cyan 65ml EcoTank L3210', 'codigo_barras': '0010343944008'},
    {'nombre': 'Tinta Epson 544 Magenta', 'marca': 'Epson', 'modelo': 'T544320', 'categoria': 'Tinta', 'stock': 0, 'precio': 12000, 'descripcion': 'Magenta 65ml EcoTank L3210', 'codigo_barras': '0010343944015'},
    {'nombre': 'Tinta Epson 544 Amarillo', 'marca': 'Epson', 'modelo': 'T544420', 'categoria': 'Tinta', 'stock': 0, 'precio': 12000, 'descripcion': 'Amarillo 65ml EcoTank L3210', 'codigo_barras': '0010343944022'},
    {'nombre': 'Tinta Epson 664 Negro', 'marca': 'Epson', 'modelo': 'T664120', 'categoria': 'Tinta', 'stock': 0, 'precio': 11500, 'descripcion': 'Negro 70ml EcoTank L220', 'codigo_barras': '0010343907850'},
    {'nombre': 'Tinta Epson 664 Cyan', 'marca': 'Epson', 'modelo': 'T664220', 'categoria': 'Tinta', 'stock': 0, 'precio': 11500, 'descripcion': 'Cyan 70ml EcoTank L220', 'codigo_barras': '0010343907867'},
    {'nombre': 'Tinta Epson 664 Magenta', 'marca': 'Epson', 'modelo': 'T664320', 'categoria': 'Tinta', 'stock': 0, 'precio': 11500, 'descripcion': 'Magenta 70ml EcoTank L220', 'codigo_barras': '0010343907874'},
    {'nombre': 'Tinta Epson 664 Amarillo', 'marca': 'Epson', 'modelo': 'T664420', 'categoria': 'Tinta', 'stock': 0, 'precio': 11500, 'descripcion': 'Amarillo 70ml EcoTank L220', 'codigo_barras': '0010343907881'},
    
    # ==================== TINTAS CANON ====================
    {'nombre': 'Tinta Canon GI-790 Negro', 'marca': 'Canon', 'modelo': 'GI-790BK', 'categoria': 'Tinta', 'stock': 0, 'precio': 11500, 'descripcion': 'Negro 70ml Pixma G1010', 'codigo_barras': '4549292065060'},
    {'nombre': 'Tinta Canon GI-790 Cyan', 'marca': 'Canon', 'modelo': 'GI-790C', 'categoria': 'Tinta', 'stock': 0, 'precio': 11500, 'descripcion': 'Cyan 70ml Pixma G1010', 'codigo_barras': '4549292065077'},
    {'nombre': 'Tinta Canon GI-790 Magenta', 'marca': 'Canon', 'modelo': 'GI-790M', 'categoria': 'Tinta', 'stock': 0, 'precio': 11500, 'descripcion': 'Magenta 70ml Pixma G1010', 'codigo_barras': '4549292065084'},
    {'nombre': 'Tinta Canon GI-790 Amarillo', 'marca': 'Canon', 'modelo': 'GI-790Y', 'categoria': 'Tinta', 'stock': 0, 'precio': 11500, 'descripcion': 'Amarillo 70ml Pixma G1010', 'codigo_barras': '4549292065091'},
    {'nombre': 'Tinta Canon GI-90 Negro', 'marca': 'Canon', 'modelo': 'GI-90BK', 'categoria': 'Tinta', 'stock': 0, 'precio': 12500, 'descripcion': 'Negro 135ml Pixma G3110', 'codigo_barras': '4549292064513'},
    {'nombre': 'Tinta Canon GI-90 Cyan', 'marca': 'Canon', 'modelo': 'GI-90C', 'categoria': 'Tinta', 'stock': 0, 'precio': 12500, 'descripcion': 'Cyan 70ml Pixma G3110', 'codigo_barras': '4549292064520'},
    {'nombre': 'Tinta Canon GI-90 Magenta', 'marca': 'Canon', 'modelo': 'GI-90M', 'categoria': 'Tinta', 'stock': 0, 'precio': 12500, 'descripcion': 'Magenta 70ml Pixma G3110', 'codigo_barras': '4549292064537'},
    {'nombre': 'Tinta Canon GI-90 Amarillo', 'marca': 'Canon', 'modelo': 'GI-90Y', 'categoria': 'Tinta', 'stock': 0, 'precio': 12500, 'descripcion': 'Amarillo 70ml Pixma G3110', 'codigo_barras': '4549292064544'},
    
    # ==================== TINTAS HP ====================
    {'nombre': 'Tinta HP 32 Negro', 'marca': 'HP', 'modelo': '1VV24AL', 'categoria': 'Tinta', 'stock': 0, 'precio': 14000, 'descripcion': 'Negro 480ml Smart Tank 750', 'codigo_barras': '0194850099488'},
    {'nombre': 'Tinta HP 31 Cyan', 'marca': 'HP', 'modelo': '1VV76AL', 'categoria': 'Tinta', 'stock': 0, 'precio': 14000, 'descripcion': 'Cyan 240ml Smart Tank 750', 'codigo_barras': '0194850099495'},
    {'nombre': 'Tinta HP 31 Magenta', 'marca': 'HP', 'modelo': '1VV75AL', 'categoria': 'Tinta', 'stock': 0, 'precio': 14000, 'descripcion': 'Magenta 240ml Smart Tank 750', 'codigo_barras': '0194850099501'},
    {'nombre': 'Tinta HP 31 Amarillo', 'marca': 'HP', 'modelo': '1VV77AL', 'categoria': 'Tinta', 'stock': 0, 'precio': 14000, 'descripcion': 'Amarillo 240ml Smart Tank 750', 'codigo_barras': '0194850099518'},
    
    # ==================== PAPEL ====================
    {'nombre': 'Papel Bond A4 75g Navigator', 'marca': 'Navigator', 'modelo': 'A4-75g', 'categoria': 'Papel', 'stock': 0, 'precio': 3500, 'descripcion': 'Resma 500 hojas A4 75g', 'codigo_barras': '5602024116191'},
    {'nombre': 'Papel Bond Carta 75g Xerox', 'marca': 'Xerox', 'modelo': 'Letter-75g', 'categoria': 'Papel', 'stock': 0, 'precio': 3500, 'descripcion': 'Resma 500 hojas Carta 75g', 'codigo_barras': '0095205595659'},
    {'nombre': 'Papel Bond A4 80g HP', 'marca': 'HP', 'modelo': 'A4-80g', 'categoria': 'Papel', 'stock': 0, 'precio': 3800, 'descripcion': 'Resma 500 hojas A4 80g', 'codigo_barras': '0887758443354'},
    {'nombre': 'Papel Fotográfico Glossy HP A4', 'marca': 'HP', 'modelo': 'Q8692A', 'categoria': 'Papel', 'stock': 0, 'precio': 8500, 'descripcion': 'Papel foto brillante 50 hojas', 'codigo_barras': '0829160766973'},
    {'nombre': 'Papel Fotográfico Glossy Epson A4', 'marca': 'Epson', 'modelo': 'S041062', 'categoria': 'Papel', 'stock': 0, 'precio': 8200, 'descripcion': 'Papel foto brillante 50 hojas', 'codigo_barras': '0010343837515'},
    {'nombre': 'Papel Fotográfico Matte Canon A4', 'marca': 'Canon', 'modelo': 'MP-101', 'categoria': 'Papel', 'stock': 0, 'precio': 7500, 'descripcion': 'Papel foto mate 50 hojas', 'codigo_barras': '4960999631325'},
    {'nombre': 'Papel Opalina A4 180g', 'marca': 'Offset', 'modelo': 'A4-180g', 'categoria': 'Papel', 'stock': 0, 'precio': 12000, 'descripcion': 'Paquete 100 hojas opalina', 'codigo_barras': '7809512345678'},
    
    # ==================== REPUESTOS Y CONSUMIBLES ====================
    {'nombre': 'Tambor Brother DR-2340', 'marca': 'Brother', 'modelo': 'DR-2340', 'categoria': 'Repuesto', 'stock': 0, 'precio': 85000, 'descripcion': 'Unidad tambor 12000 pág', 'codigo_barras': '4977766715188'},
    {'nombre': 'Tambor Brother DR-730', 'marca': 'Brother', 'modelo': 'DR-730', 'categoria': 'Repuesto', 'stock': 0, 'precio': 95000, 'descripcion': 'Unidad tambor 12000 pág', 'codigo_barras': '4977766798938'},
    {'nombre': 'Tambor HP 19A', 'marca': 'HP', 'modelo': 'CF219A', 'categoria': 'Repuesto', 'stock': 0, 'precio': 125000, 'descripcion': 'Tambor imagen 12000 pág', 'codigo_barras': '0888182161135'},
    {'nombre': 'Fusor HP M402/M426', 'marca': 'HP', 'modelo': 'RM2-5425', 'categoria': 'Repuesto', 'stock': 0, 'precio': 145000, 'descripcion': 'Unidad fusora 110V', 'codigo_barras': '0190780972458'},
    {'nombre': 'Fusor HP M404/M428', 'marca': 'HP', 'modelo': 'J8J87A', 'categoria': 'Repuesto', 'stock': 0, 'precio': 155000, 'descripcion': 'Kit fusora 110V', 'codigo_barras': '0190781094777'},
    {'nombre': 'Kit Mantenimiento HP M404', 'marca': 'HP', 'modelo': 'J8J88A', 'categoria': 'Repuesto', 'stock': 0, 'precio': 125000, 'descripcion': 'Kit mantenimiento 225K pág', 'codigo_barras': '0190781094784'},
    {'nombre': 'Rodillo Pickup HP M402', 'marca': 'HP', 'modelo': 'RL1-3642', 'categoria': 'Repuesto', 'stock': 0, 'precio': 18000, 'descripcion': 'Rodillo recogida papel', 'codigo_barras': '0190780456789'},
    {'nombre': 'Rodillo Pickup Brother HL-L2350', 'marca': 'Brother', 'modelo': 'LY8842001', 'categoria': 'Repuesto', 'stock': 0, 'precio': 15000, 'descripcion': 'Rodillo recogida papel', 'codigo_barras': '4977766798123'},
    {'nombre': 'Almohadilla Separación HP M402', 'marca': 'HP', 'modelo': 'RM1-8293', 'categoria': 'Repuesto', 'stock': 0, 'precio': 12000, 'descripcion': 'Separation pad', 'codigo_barras': '0190780345678'},
    {'nombre': 'Almohadilla Separación Canon MF445', 'marca': 'Canon', 'modelo': 'FM4-8035', 'categoria': 'Repuesto', 'stock': 0, 'precio': 14000, 'descripcion': 'Separation pad', 'codigo_barras': '4549292076547'},
    
    # ==================== CABEZALES ====================
    {'nombre': 'Cabezal HP 711 Negro', 'marca': 'HP', 'modelo': 'CZ129A', 'categoria': 'Repuesto', 'stock': 0, 'precio': 145000, 'descripcion': 'Printhead negro DesignJet', 'codigo_barras': '0884420724315'},
    {'nombre': 'Cabezal Canon QY6-0090', 'marca': 'Canon', 'modelo': 'QY6-0090', 'categoria': 'Repuesto', 'stock': 0, 'precio': 85000, 'descripcion': 'Cabezal impresión Pixma G', 'codigo_barras': '4549292067231'},
    {'nombre': 'Cabezal Epson L210/L355', 'marca': 'Epson', 'modelo': 'F181010', 'categoria': 'Repuesto', 'stock': 0, 'precio': 95000, 'descripcion': 'Printhead EcoTank', 'codigo_barras': '0010343900245'},
    
    # ==================== OTROS CONSUMIBLES ====================
    {'nombre': 'Bolsa Residual Brother WT-223CL', 'marca': 'Brother', 'modelo': 'WT-223CL', 'categoria': 'Repuesto', 'stock': 0, 'precio': 28000, 'descripcion': 'Waste toner box 50K pág', 'codigo_barras': '4977766794770'},
    {'nombre': 'Bolsa Residual Canon FM3-5945', 'marca': 'Canon', 'modelo': 'FM3-5945', 'categoria': 'Repuesto', 'stock': 0, 'precio': 32000, 'descripcion': 'Waste toner container', 'codigo_barras': '4549292088465'},
    {'nombre': 'Cinta impresora Epson LX-350', 'marca': 'Epson', 'modelo': 'S015633', 'categoria': 'Cinta', 'stock': 0, 'precio': 8500, 'descripcion': 'Cinta matriz punto negro', 'codigo_barras': '0010343865181'},
    {'nombre': 'Cinta impresora Epson FX-890', 'marca': 'Epson', 'modelo': 'S015329', 'categoria': 'Cinta', 'stock': 0, 'precio': 9500, 'descripcion': 'Cinta matriz punto negro', 'codigo_barras': '0010343839755'},
    
    # ==================== ACCESORIOS ====================
    {'nombre': 'Cable USB 2.0 impresora 3m', 'marca': 'Verbatim', 'modelo': 'USB-AB-3M', 'categoria': 'Accesorio', 'stock': 0, 'precio': 4500, 'descripcion': 'Cable USB A-B para impresora', 'codigo_barras': '0023942981015'},
    {'nombre': 'Cable de red Cat6 3m', 'marca': 'D-Link', 'modelo': 'NCB-C6ABLUR-3', 'categoria': 'Accesorio', 'stock': 0, 'precio': 3500, 'descripcion': 'Cable ethernet Cat6 UTP', 'codigo_barras': '0790069456732'},
    {'nombre': 'Cable de poder impresora', 'marca': 'Genérico', 'modelo': 'PWR-3PIN', 'categoria': 'Accesorio', 'stock': 0, 'precio': 2500, 'descripcion': 'Cable alimentación 3 pines', 'codigo_barras': '7809512345685'},
    {'nombre': 'Bandeja papel adicional HP', 'marca': 'HP', 'modelo': 'L0H17A', 'categoria': 'Accesorio', 'stock': 0, 'precio': 95000, 'descripcion': 'Bandeja 550 hojas M402/M404', 'codigo_barras': '0889894890443'},
]
