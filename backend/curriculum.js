// backend/curriculum.js
// Lehrplan Sachsen Gymnasium – Abitur 2025/26

const CURRICULUM = {
    Mathematik: {
        icon: "📐",
        topicsGK: [
            { id:"m-gk-1",  title:"Analysis – Ableitungsregeln",     desc:"Potenz-, Produkt-, Ketten-, Quotientenregel",          exam:"Kurvenuntersuchung", lkOnly:false },
            { id:"m-gk-2",  title:"Kurvendiskussion",                 desc:"Extrem- und Wendepunkte, Symmetrie, Asymptoten",        exam:"Vollständige Kurvenuntersuchung", lkOnly:false },
            { id:"m-gk-3",  title:"Extremwertaufgaben",               desc:"Hauptbedingung & Nebenbedingung aufstellen und lösen",   exam:"HB/NB-Aufgaben", lkOnly:false },
            { id:"m-gk-4",  title:"Integralrechnung",                 desc:"Stammfunktionen, bestimmtes Integral, Flächeninhalte",  exam:"Flächen zwischen Graphen", lkOnly:false },
            { id:"m-gk-5",  title:"Exponential- & Logarithmusfunkt.", desc:"e-Funktion, ln, Wachstum/Zerfall",                     exam:"Wachstumsprozesse", lkOnly:false },
            { id:"m-gk-6",  title:"Trigonometrische Funktionen",      desc:"sin, cos, tan, Eigenschaften und Ableitungen",          exam:"Sinusfunktionen modellieren", lkOnly:false },
            { id:"m-gk-7",  title:"Vektoren im Raum",                 desc:"Vektoroperationen, Skalarprodukt, Winkel",              exam:"Geometrie im Raum", lkOnly:false },
            { id:"m-gk-8",  title:"Geraden & Ebenen",                 desc:"Parameter-, Normal-, Koordinatenform; Lagebeziehungen", exam:"Abstände und Schnitte", lkOnly:false },
            { id:"m-gk-9",  title:"Lineare Gleichungssysteme",        desc:"Gauß-Algorithmus, Lösungsmengen",                      exam:"LGS lösen und interpretieren", lkOnly:false },
            { id:"m-gk-10", title:"Stochastik – Grundlagen",          desc:"Zufallsexperimente, bedingte Wahrscheinlichkeit, Bayes", exam:"Baumdiagramme, Laplace", lkOnly:false },
            { id:"m-gk-11", title:"Binomialverteilung",               desc:"B(n;p), Erwartungswert, Standardabweichung",            exam:"Bernoulli-Aufgaben", lkOnly:false },
            { id:"m-gk-12", title:"Normalverteilung",                 desc:"N(μ;σ), Standardisierung, Sigma-Regeln",               exam:"Tabelle nutzen, Wahrsch. berechnen", lkOnly:false },
        ],
        topicsLK: [
            { id:"m-lk-1",  title:"Analysis – Ableitungsregeln (LK)", desc:"Alle Regeln inkl. Verkettung komplexer Fkt.",           exam:"Anspruchsvolle Ableitungen", lkOnly:true },
            { id:"m-lk-2",  title:"Kurvendiskussion (LK)",            desc:"Vollständige Analyse, Funktionsscharen",                exam:"Scharaufgaben", lkOnly:true },
            { id:"m-lk-3",  title:"Extremwertaufgaben (LK)",          desc:"Anspruchsvolle HB/NB, Optimierung",                    exam:"Komplexe Optimierung", lkOnly:true },
            { id:"m-lk-4",  title:"Integralrechnung (LK)",            desc:"Uneigentliche Integrale, Rotationskörper",             exam:"Rotationsvolumen", lkOnly:true },
            { id:"m-lk-5",  title:"Vektoren & Matrizen",              desc:"Vektorprodukt, Matrizen, lineare Abbildungen",         exam:"Geometrie komplex", lkOnly:true },
            { id:"m-lk-6",  title:"Hypothesentest",                   desc:"H₀, Signifikanzniveau, kritischer Bereich",            exam:"Einseitige/zweiseitige Tests", lkOnly:true },
            { id:"m-lk-7",  title:"Konfidenzintervalle",              desc:"Schätzung von Parametern, Stichproben",                exam:"Intervallschätzung", lkOnly:true },
            { id:"m-lk-8",  title:"Regression & Korrelation",         desc:"Lineare Regression, Korrelationskoeffizient",          exam:"Datensätze analysieren", lkOnly:true },
        ]
    },
    Physik: {
        icon: "⚛️",
        topicsGK: [
            { id:"p-gk-1", title:"Kinematik",           desc:"Gleichförmige & beschleunigte Bewegung, Kreisbewegung",      exam:"v-t und s-t Diagramme", lkOnly:false },
            { id:"p-gk-2", title:"Dynamik & Kräfte",    desc:"Newtonsche Axiome, Reibung, Federkraft",                    exam:"Kräftegleichgewicht", lkOnly:false },
            { id:"p-gk-3", title:"Energie & Impuls",    desc:"E_kin, E_pot, Arbeit, Leistung, Impulserhaltung",           exam:"Energieerhaltung", lkOnly:false },
            { id:"p-gk-4", title:"Schwingungen & Wellen",desc:"Feder- und Fadenpendel, Wellengleichung, Interferenz",      exam:"Frequenz und Wellenlänge", lkOnly:false },
            { id:"p-gk-5", title:"Elektrisches Feld",   desc:"Kondensator, Feldstärke, Energie",                         exam:"Kondensatoraufgaben", lkOnly:false },
            { id:"p-gk-6", title:"Stromkreise",         desc:"Ohmsches Gesetz, Reihe & Parallel, Kirchhoffsche Regeln",   exam:"Widerstandsschaltungen", lkOnly:false },
            { id:"p-gk-7", title:"Magnetfeld & Induktion",desc:"Lorentzkraft, Induktionsgesetz, Transformator",           exam:"Induktionsaufgaben", lkOnly:false },
            { id:"p-gk-8", title:"Fotoeffekt & Quantenphysik",desc:"Planck, Einstein, Bohr-Atommodell",                  exam:"Lichtquanten, Energieniveaus", lkOnly:false },
            { id:"p-gk-9", title:"Radioaktivität",      desc:"α/β/γ-Strahlung, Zerfallsgesetz, Halbwertszeit",           exam:"Zerfallskurven", lkOnly:false },
        ],
        topicsLK: [
            { id:"p-lk-1", title:"Spezielle Relativitätstheorie",desc:"Postulate, Zeitdilatation, Längenkontraktion, E=mc²",   exam:"Relativistische Aufgaben", lkOnly:true },
            { id:"p-lk-2", title:"Thermodynamik",        desc:"Hauptsätze, Carnot-Prozess, Entropie",                     exam:"Wärmekraftmaschinen", lkOnly:true },
            { id:"p-lk-3", title:"Quantenmechanik",      desc:"Unschärferelation, Welle-Teilchen-Dualismus, de Broglie",   exam:"Wellenlängen berechnen", lkOnly:true },
            { id:"p-lk-4", title:"Wechselstrom",         desc:"Effektivwerte, Kapazitiver/Induktiver Widerstand, Resonanz", exam:"Schwingkreise", lkOnly:true },
            { id:"p-lk-5", title:"Kern- & Teilchenphysik",desc:"Kernspaltung, -fusion, Standardmodell",                   exam:"Massendefekt, Bindungsenergie", lkOnly:true },
        ]
    },
    Chemie: {
        icon: "🧪",
        topicsGK: [
            { id:"c-gk-1", title:"Atombau & PSE",          desc:"Schalenmodell, Orbitale, Periodensystem-Trends",            exam:"Eigenschaften aus PSE ableiten", lkOnly:false },
            { id:"c-gk-2", title:"Chemische Bindungen",     desc:"Ionenbindung, kovalent, Metall; zwischenmolekular",        exam:"Bindungstypen zuordnen", lkOnly:false },
            { id:"c-gk-3", title:"Säuren & Basen",          desc:"pH-Wert, Brønsted, starke/schwache Säuren",                exam:"pH berechnen", lkOnly:false },
            { id:"c-gk-4", title:"Pufferlösungen",          desc:"Henderson-Hasselbalch, biologische Puffer",                exam:"Puffer-pH berechnen", lkOnly:false },
            { id:"c-gk-5", title:"Redoxreaktionen",         desc:"Oxidationszahlen, OIL RIG, Halbzellreaktionen",            exam:"Redoxgleichungen ausgleichen", lkOnly:false },
            { id:"c-gk-6", title:"Elektrochemie",           desc:"Galvanische Zellen, Elektrolyse, Nernst-Gleichung",        exam:"Zellspannung berechnen", lkOnly:false },
            { id:"c-gk-7", title:"Chemisches Gleichgewicht",desc:"Massenwirkungsgesetz, Le Chatelier",                       exam:"K_c berechnen", lkOnly:false },
            { id:"c-gk-8", title:"Organische Chemie",       desc:"Alkane/ene/ine, Aromaten, funktionelle Gruppen",           exam:"Nomenklatur, Reaktionstypen", lkOnly:false },
            { id:"c-gk-9", title:"Stöchiometrie",           desc:"Mol, Masse, Konzentration, Ausbeute",                      exam:"Stöchiometrische Berechnungen", lkOnly:false },
        ],
        topicsLK: [
            { id:"c-lk-1", title:"Reaktionskinetik",        desc:"Geschwindigkeit, Aktivierungsenergie, Arrhenius",           exam:"Halbwertszeit, Ratengesetz", lkOnly:true },
            { id:"c-lk-2", title:"Biochemie",               desc:"Proteine, Enzyme, Kohlenhydrate, Fette",                   exam:"Enzymkinetik (Michaelis-Menten)", lkOnly:true },
        ]
    },
    Biologie: {
        icon: "🌱",
        topicsGK: [
            { id:"b-gk-1", title:"Zellaufbau & Organellen", desc:"Prokaryot vs. Eukaryot, Organellen und Funktionen",        exam:"Zellstrukturen zuordnen", lkOnly:false },
            { id:"b-gk-2", title:"Membran & Transport",     desc:"Diffusion, Osmose, aktiver Transport",                     exam:"Transportprozesse erklären", lkOnly:false },
            { id:"b-gk-3", title:"Zellteilung (Mitose & Meiose)",desc:"Phasen, Bedeutung für Wachstum und Fortpflanzung",   exam:"Phasen benennen und erklären", lkOnly:false },
            { id:"b-gk-4", title:"Genetik – Mendelsche Regeln",desc:"Uniformität, Spaltung, Unabhängigkeit; Kreuzungen",     exam:"Erbgänge berechnen", lkOnly:false },
            { id:"b-gk-5", title:"Molekularbiologie",       desc:"DNA-Struktur, Replikation, Transkription, Translation",    exam:"Protein­biosynthese beschreiben", lkOnly:false },
            { id:"b-gk-6", title:"Fotosynthese",            desc:"Lichtreaktion (Thylakoid) & Calvin-Zyklus (Stroma)",       exam:"Gleichung & Teilprozesse", lkOnly:false },
            { id:"b-gk-7", title:"Zellatmung",              desc:"Glykolyse, Citratzyklus, Atmungskette, ATP-Bilanz",        exam:"Vergleich mit Fotosynthese", lkOnly:false },
            { id:"b-gk-8", title:"Ökologie",                desc:"Ökosystem, Nahrungsnetz, Energiefluss, Populationsdynamik",exam:"Nahrungsnetze analysieren", lkOnly:false },
            { id:"b-gk-9", title:"Evolution",               desc:"Selektion, Anpassung, Artbildung, Belege",                 exam:"Evolutionsmechanismen erklären", lkOnly:false },
        ],
        topicsLK: [
            { id:"b-lk-1", title:"Neurobiologie",          desc:"Aktionspotential, Synapse, EPSP/IPSP, Neurotransmitter",    exam:"AP und Synapsenübertragung", lkOnly:true },
            { id:"b-lk-2", title:"Immunsystem",            desc:"Angeboren & erworben, B/T-Lymphozyten, Impfung",            exam:"Immunantwort beschreiben", lkOnly:true },
            { id:"b-lk-3", title:"Genregulation",          desc:"Operonmodell, Enhancer, Epigenetik",                        exam:"lac-Operon erklären", lkOnly:true },
            { id:"b-lk-4", title:"Gentechnik & CRISPR",   desc:"PCR, Klonierung, CRISPR-Cas9, Anwendungen",                 exam:"Gentechnik-Methoden erklären", lkOnly:true },
        ]
    },
    Deutsch: {
        icon: "📖",
        topicsGK: [
            { id:"d-gk-1", title:"Pragmatische Textanalyse",   desc:"Argumentationsstruktur, Adressat, Intention, Mittel",  exam:"Kommentar, Rede, Zeitungsartikel", lkOnly:false },
            { id:"d-gk-2", title:"Gedichtanalyse",             desc:"Metrum, Reim, Strophe, Stilmittel, Epochenbezug",      exam:"Gedichtinterpretation", lkOnly:false },
            { id:"d-gk-3", title:"Prosaanalyse",               desc:"Erzählperspektive, Erzähltechnik, Figuren",             exam:"Textanalyse Kurzgeschichte/Roman", lkOnly:false },
            { id:"d-gk-4", title:"Dramenanalyse",              desc:"Aufbau, Figurenrede, Regieanweisung, Konflikt",         exam:"Drama-Szenenanalyse", lkOnly:false },
            { id:"d-gk-5", title:"Erörterung",                 desc:"These, Argument, Beleg, Gegenargument, Schluss",        exam:"Textgebundene Erörterung", lkOnly:false },
            { id:"d-gk-6", title:"Stilmittel & Rhetorik",      desc:"Metapher, Anapher, Klimax, Ironie, Ellipse u.v.m.",     exam:"Stilmittel identifizieren und deuten", lkOnly:false },
            { id:"d-gk-7", title:"Literaturepochen",           desc:"Barock bis Gegenwart: Merkmale, Autoren, Werke",        exam:"Epochenzuordnung & Interpretation", lkOnly:false },
            { id:"d-gk-8", title:"Materialgestütztes Schreiben",desc:"Informieren, Argumentieren mit Materialien",           exam:"Abitur Aufgabentyp III", lkOnly:false },
        ],
        topicsLK: [
            { id:"d-lk-1", title:"Sprachfunktionen & Kommunikation",desc:"Bühler, Schulz von Thun, Sprachvarietäten",       exam:"Kommunikationsmodelle anwenden", lkOnly:true },
            { id:"d-lk-2", title:"Sprachwandel",                desc:"Historische Entwicklung, Einflüsse, Anglizismen",     exam:"Sprachkritik & Sprachgeschichte", lkOnly:true },
        ]
    },
    Englisch: {
        icon: "🇬🇧",
        topicsGK: [
            { id:"e-gk-1", title:"Reading Comprehension",     desc:"Sachtexte und literarische Texte verstehen und analysieren", exam:"Textverständnis und -analyse", lkOnly:false },
            { id:"e-gk-2", title:"Essay Writing",             desc:"Argumentative & analytische Essays strukturieren",      exam:"Abituraufsatz", lkOnly:false },
            { id:"e-gk-3", title:"Mediation",                 desc:"Deutsch↔Englisch sinngemäß übertragen, Register anpassen", exam:"Mediation Task", lkOnly:false },
            { id:"e-gk-4", title:"Grammar – Tenses",          desc:"Past, Present Perfect, Future, Conditionals (Typ 1–3)", exam:"Lückentexte, Korrektheit", lkOnly:false },
            { id:"e-gk-5", title:"Grammar – Passiv & Reported Speech",desc:"Passiv bilden, indirekte Rede, Modal Verbs",   exam:"Grammatik-Aufgaben", lkOnly:false },
            { id:"e-gk-6", title:"Globalization & Society",   desc:"Migration, Klimawandel, Social Media, Cultural Identity", exam:"Comment oder Essay", lkOnly:false },
            { id:"e-gk-7", title:"British & American Culture",desc:"Geschichte, Politik, Kultur UK/USA",                   exam:"Kulturwissen im Text", lkOnly:false },
        ],
        topicsLK: [
            { id:"e-lk-1", title:"Literary Analysis",         desc:"Novel, Short Story, Poetry, Drama – vertiefte Analyse", exam:"Literarischer Essay", lkOnly:true },
            { id:"e-lk-2", title:"Listening Comprehension",   desc:"Audiotexte verstehen und Fragen beantworten",          exam:"Hörverständnis im Abitur", lkOnly:true },
        ]
    },
    Geschichte: {
        icon: "🏛️",
        topicsGK: [
            { id:"h-gk-1",  title:"Französische Revolution",    desc:"Ursachen, Verlauf 1789–1799, Bedeutung für Europa",    exam:"Quellenanalyse Revolutionstexte", lkOnly:false },
            { id:"h-gk-2",  title:"Industrialisierung",          desc:"Entstehung, soziale Frage, Arbeiterbewegung",          exam:"Diagramme interpretieren", lkOnly:false },
            { id:"h-gk-3",  title:"Kaiserreich & Imperialismus", desc:"Gründung 1871, Wilhelminismus, Kolonialpolitik",       exam:"Karikaturen analysieren", lkOnly:false },
            { id:"h-gk-4",  title:"1. Weltkrieg (1914–1918)",    desc:"Ursachen, Verlauf, Kriegsende, Versailler Vertrag",    exam:"Ursachenanalyse", lkOnly:false },
            { id:"h-gk-5",  title:"Weimarer Republik",           desc:"Entstehung, Krisen, Scheitern 1919–1933",             exam:"Verfassungstext analysieren", lkOnly:false },
            { id:"h-gk-6",  title:"Nationalsozialismus",         desc:"Machtübernahme, Gleichschaltung, Holocaust",           exam:"Gesetzestexte und Propaganda", lkOnly:false },
            { id:"h-gk-7",  title:"2. Weltkrieg & Holocaust",    desc:"Verlauf, Kriegsverbrechen, Shoa, Kriegsende",          exam:"Zeugenberichte auswerten", lkOnly:false },
            { id:"h-gk-8",  title:"Kalter Krieg (1947–1991)",    desc:"Bipolare Welt, Krisen, Entspannung, Mauerfall",        exam:"Quellen vergleichen", lkOnly:false },
            { id:"h-gk-9",  title:"DDR & BRD",                   desc:"Gründung, Alltag, Vergleich, Wiedervereinigung 1990",  exam:"Systemvergleich", lkOnly:false },
            { id:"h-gk-10", title:"Europäische Integration",     desc:"EWG, EG, EU – Schritte der Einigung",                 exam:"EU-Entwicklung erklären", lkOnly:false },
        ],
        topicsLK: [
            { id:"h-lk-1", title:"Antike: Athen & Sparta",      desc:"Demokratie vs. Oligarchie, Perikles, Lykurg",          exam:"Vergleich antike Systeme", lkOnly:true },
            { id:"h-lk-2", title:"Reformation & Religionskriege",desc:"Luther 1517, Augsburger Frieden, 30-jähr. Krieg",     exam:"Reformation analysieren", lkOnly:true },
        ]
    },
    Gemeinschaftskunde: {
        icon: "⚖️",
        topicsGK: [
            { id:"g-gk-1", title:"Demokratie – Grundprinzipien", desc:"Volksouveränität, Gewaltenteilung, Formen der Demokratie", exam:"Demokratieprinzipien erklären", lkOnly:false },
            { id:"g-gk-2", title:"Grundgesetz & Grundrechte",    desc:"Art. 1–19 GG, Art. 20 GG (5 Prinzipien), Ewigkeitsklausel", exam:"GG-Artikel analysieren", lkOnly:false },
            { id:"g-gk-3", title:"Bundestag & Wahlsystem",       desc:"Aufgaben, Wahlrecht, 5%-Hürde, Wahlverfahren",         exam:"Wahl-Diagramme auswerten", lkOnly:false },
            { id:"g-gk-4", title:"Bundesrat & Föderalismus",     desc:"Aufgaben des Bundesrats, Kompetenzverteilung Bund/Land", exam:"Föderalismus-Aufgaben", lkOnly:false },
            { id:"g-gk-5", title:"Rechtsstaat & Gewaltenteilung",desc:"Legislative, Exekutive, Judikative; BVerfG",            exam:"Rechtsstaatlichkeit prüfen", lkOnly:false },
            { id:"g-gk-6", title:"Soziale Marktwirtschaft",      desc:"Marktmechanismus, Konjunkturpolitik, Sozialpolitik",    exam:"Wirtschaftsdiagramme", lkOnly:false },
            { id:"g-gk-7", title:"EU – Geschichte & Organe",     desc:"Europ. Rat, Parlament, Kommission, EuGH, EU-Recht",    exam:"EU-Organe zuordnen", lkOnly:false },
            { id:"g-gk-8", title:"Menschenrechte (AEMR & EMRK)",desc:"Entstehung, Inhalt, Durchsetzung",                     exam:"Menschenrechtsverletzungen analysieren", lkOnly:false },
            // Klasse 11: Neue Themen
            { id:"g-gk-9",  title:"Deutsche Außenpolitik (Kl. 11)",desc:"Art. 24–26 GG, NATO, EU-GASP, Wertebasierte AP",    exam:"Außenpolitische Grundsätze", lkOnly:false },
            { id:"g-gk-10", title:"Vereinte Nationen – UNO (Kl. 11)",desc:"Generalversammlung, Sicherheitsrat, P5-Veto, UNESCO/UNICEF/WHO", exam:"UN-Organe und Aufgaben", lkOnly:false },
            { id:"g-gk-11", title:"Globalisierung – Begriff & Ursachen (Kl. 11)",desc:"Dimensionen, Treiber, WTO, Internet",  exam:"Globalisierung definieren", lkOnly:false },
            { id:"g-gk-12", title:"Globalisierung – Chancen & Risiken (Kl. 11)",desc:"Wohlstand, Ungleichheit, Umwelt, Abhängigkeit", exam:"Chancen und Risiken abwägen", lkOnly:false },
        ],
        topicsLK: [
            { id:"g-lk-1", title:"Demokratietheorien",           desc:"Deliberative, partizipative, repräsentative Demokratie", exam:"Theorievergleich", lkOnly:true },
            { id:"g-lk-2", title:"Rechtsstaat vertieft",         desc:"BGB, StGB, Verwaltungsrecht, Normenkontrolle BVerfG",   exam:"Rechtsfälle analysieren", lkOnly:true },
            { id:"g-lk-3", title:"Geldpolitik der EZB",          desc:"Inflation, Leitzins, Quantitative Easing",              exam:"Geldpolitik-Aufgaben", lkOnly:true },
            { id:"g-lk-4", title:"Klimapolitik & Agenda 2030",   desc:"17 SDGs, Pariser Abkommen, Klimagerechtigkeit",         exam:"Nachhaltigkeits-Essay", lkOnly:true },
            { id:"g-lk-5", title:"Multilateralismus vs. Nationalismus",desc:"Internationale Ordnung, Souveränität, UN-Reform", exam:"Vergleichende Analyse", lkOnly:true },
        ]
    },
    Geographie: {
        icon: "🌍",
        topicsGK: [
            { id:"geo-gk-1", title:"Plattentektonik",           desc:"Platten, Divergenz/Konvergenz, Erdbeben, Vulkanismus",   exam:"Naturkatastrophen erklären", lkOnly:false },
            { id:"geo-gk-2", title:"Klimazonen & -diagramme",   desc:"6 Klimazonen, Diagramm lesen, humid/arid",               exam:"Klimadiagramm analysieren", lkOnly:false },
            { id:"geo-gk-3", title:"Klimawandel",               desc:"Ursachen (CO₂), Folgen, Paris-Abkommen",                 exam:"Klimawandel-Daten auswerten", lkOnly:false },
            { id:"geo-gk-4", title:"Demographischer Übergang",  desc:"5 Phasen, GFR, Bevölkerungspyramide",                    exam:"Bevölkerungspyramiden lesen", lkOnly:false },
            { id:"geo-gk-5", title:"Migration",                 desc:"Typen (Flucht, Arbeit, Umwelt), Folgen",                 exam:"Migrationsursachen analysieren", lkOnly:false },
            { id:"geo-gk-6", title:"Urbanisierung",             desc:"Megastädte, Stadtstrukturmodelle (Burgess/Hoyt)",        exam:"Stadtmodelle erklären", lkOnly:false },
            { id:"geo-gk-7", title:"Globalisierung",            desc:"Wirtschaft, Handel, Unternehmen, Ungleichheit",          exam:"HDI & Entwicklung", lkOnly:false },
            { id:"geo-gk-8", title:"Nachhaltigkeit",            desc:"SDGs, ökologischer Fußabdruck, Ressourcennutzung",       exam:"Nachhaltigkeitsziele", lkOnly:false },
        ],
        topicsLK: []
    },
    Ethik: {
        icon: "🕊️",
        topicsGK: [
            { id:"eth-1", title:"Philosophische Anthropologie", desc:"Was ist der Mensch? Freiheit, Würde, Identität",        exam:"Textanalyse philosophisch", lkOnly:false },
            { id:"eth-2", title:"Ethische Grundpositionen",    desc:"Utilitarismus (Bentham/Mill), Deontologie (Kant), Tugendethik (Aristoteles)", exam:"Positionen vergleichen", lkOnly:false },
            { id:"eth-3", title:"Aktuelle Ethik-Debatten",     desc:"Sterbehilfe, Tierethik, KI-Ethik, Klimagerechtigkeit",  exam:"Erörterung mit Positionen", lkOnly:false },
            { id:"eth-4", title:"Theodizee & Glaube",          desc:"Gottesbeweise, Leidproblem, Glaube vs. Wissenschaft",   exam:"Argumentationsanalyse", lkOnly:false },
        ],
        topicsLK: []
    }
};

module.exports = CURRICULUM;
