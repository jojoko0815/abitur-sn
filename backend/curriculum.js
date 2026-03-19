// backend/curriculum.js

const CURRICULUM = {
    Mathematik: {
        icon: "📐",
        topics: [
            {
                id: "m1",
                title: "Differentialrechnung",
                description: "Ableitungen, Tangenten, Extremwertaufgaben. Kurvenuntersuchung von Funktionsgraphen.",
                examples: "Ableiten von Polynomen, Berechnung von Extrempunkten, Wendepunkten",
                exam: "Analyse von Funktionsgraphen, Kurvenuntersuchung im Abitur",
                difficulty: "mittel",
                lkOnly: false
            },
            {
                id: "m2",
                title: "Integralrechnung",
                description: "Flächenberechnung unter Funktionsgraphen, Hauptsatz der Differential- und Integralrechnung.",
                examples: "Fläche zwischen Kurve und x-Achse, Stammfunktionen bilden",
                exam: "Bestimmung von Flächeninhalten und Volumina",
                difficulty: "schwer",
                lkOnly: false
            },
            {
                id: "m3",
                title: "Vektoren & Raumgeometrie",
                description: "Geraden, Ebenen, Abstände im Raum. Lagebeziehungen analysieren.",
                examples: "Schnittgerade zweier Ebenen, Abstand Punkt-Ebene",
                exam: "Lagebeziehungen (parallel, windschief, senkrecht)",
                difficulty: "mittel",
                lkOnly: false
            },
            {
                id: "m4",
                title: "Binomialverteilung",
                description: "Bernoulli-Kette, Wahrscheinlichkeiten, Erwartungswert, Varianz.",
                examples: "Anzahl Erfolge bei Würfelversuchen, Trefferwahrscheinlichkeiten",
                exam: "Klausuraufgaben zur Wahrscheinlichkeit",
                difficulty: "mittel",
                lkOnly: false
            },
            {
                id: "m5",
                title: "Normalverteilung (LK)",
                description: "Eigenschaften der Normalverteilung, Sigma-Regeln, z-Score.",
                examples: "Wahrscheinlichkeiten mit z-Score berechnen",
                exam: "Dichtefunktionen und Grenzprozesse in LK-Stochastik",
                difficulty: "schwer",
                lkOnly: true
            }
        ]
    },
    Physik: {
        icon: "⚡",
        topics: [
            {
                id: "p1",
                title: "Energieerhaltung",
                description: "Konzept der Energieerhaltung, potenzielle/kinetische Energie, Energiefluss.",
                examples: "Berechnung von Wurf- und Bremswegen, Energieumwandlungen",
                exam: "Energieflussdiagramme, Energieerhaltung in Alltagszusammenhängen",
                difficulty: "mittel",
                lkOnly: false
            },
            {
                id: "p2",
                title: "Kinematik & Dynamik",
                description: "Bewegungsgleichungen, Newtonsche Gesetze, Kräfte.",
                examples: "Gleichmäßig beschleunigte Bewegung, Reibungskräfte",
                exam: "Geschwindigkeit, Beschleunigung, Bremsweg",
                difficulty: "mittel",
                lkOnly: false
            },
            {
                id: "p3",
                title: "Elektrische Felder",
                description: "Kondensator, Spule, Lorentz-Kraft, Induktion.",
                examples: "RC-Kreis, Auf- und Entladen von Kondensatoren",
                exam: "Experimentelle Fragestellungen zu RC-Kreis, Induktionsphänomene",
                difficulty: "schwer",
                lkOnly: false
            },
            {
                id: "p4",
                title: "Quantenphysik (LK)",
                description: "Photoeffekt, Bohrsches Atommodell, Radioaktivität.",
                examples: "Einsteins Photoeffektgleichung, Halbwertszeit",
                exam: "Atommodelldiskussion und Strahlenschutz",
                difficulty: "schwer",
                lkOnly: true
            }
        ]
    },
    Chemie: {
        icon: "🧪",
        topics: [
            {
                id: "c1",
                title: "Chemische Gleichgewichte",
                description: "Massenwirkungsgesetz, Reaktionsgeschwindigkeit, Le-Chatelier-Prinzip.",
                examples: "Haber-Bosch-Verfahren (NH₃-Gleichgewicht)",
                exam: "Temperatur/Druck-Einfluss auf Gleichgewichte",
                difficulty: "schwer",
                lkOnly: false
            },
            {
                id: "c2",
                title: "Organische Chemie",
                description: "Funktionelle Gruppen: Alkohole, Carbonsäuren, Ester.",
                examples: "Veresterung (Essigsäure + Ethanol → Essigester)",
                exam: "Aufbau und Eigenschaften einfacher organischer Moleküle",
                difficulty: "mittel",
                lkOnly: false
            },
            {
                id: "c3",
                title: "Elektrochemie",
                description: "Zellspannung, Redoxreaktionen an Elektroden, Elektrolyse.",
                examples: "Daniell-Element, galvanische Zellen",
                exam: "Elektrolyse und galvanische Zellen im Abitur",
                difficulty: "mittel",
                lkOnly: false
            }
        ]
    },
    Biologie: {
        icon: "🧬",
        topics: [
            {
                id: "b1",
                title: "Zellbiologie",
                description: "Bau von Zelle, Gewebe, Organe. Tier- vs. Pflanzenzelle.",
                examples: "Zellteilung (Mitose), Organsysteme",
                exam: "Zellstrukturen und Funktionen",
                difficulty: "mittel",
                lkOnly: false
            },
            {
                id: "b2",
                title: "Stoffwechselprozesse",
                description: "Fotosynthese und Zellatmung als Redoxprozesse.",
                examples: "Licht- und Dunkelreaktion, Glykolyse",
                exam: "Vergleich Fotosynthese/Zellatmung",
                difficulty: "mittel",
                lkOnly: false
            },
            {
                id: "b3",
                title: "Genetik",
                description: "DNA, Replikation, Mendelsche Regeln, Vererbung.",
                examples: "Genotyp/Phänotyp-Aufgaben, Stammbaumanalyse",
                exam: "Erbgang bei monohybriden Kreuzungen",
                difficulty: "schwer",
                lkOnly: false
            },
            {
                id: "b4",
                title: "Evolution",
                description: "Darwin/Lamarck, Fossilien, Homologie, natürliche Selektion.",
                examples: "Antibiotikaresistenz, Hominisation",
                exam: "Evolutionsbelege und Selektionsmechanismen",
                difficulty: "mittel",
                lkOnly: false
            }
        ]
    },
    Deutsch: {
        icon: "📚",
        topics: [
            {
                id: "d1",
                title: "Literatur der Moderne",
                description: "Nachkriegsliteratur, Moderne Formen (Kurzgeschichte, Drama).",
                examples: "Faust I (Auszug), Woyzeck, Kurzgeschichten",
                exam: "Analyse einer Kurzgeschichte, Inhaltsangabe",
                difficulty: "mittel",
                lkOnly: false
            },
            {
                id: "d2",
                title: "Epochen um 1800",
                description: "Klassik, Romantik, Aufklärung, Sturm und Drang.",
                examples: "Goethe, Gedichtinterpretation (Eichendorff)",
                exam: "Interpretation eines Gedichts",
                difficulty: "schwer",
                lkOnly: false
            },
            {
                id: "d3",
                title: "Materialgestütztes Schreiben",
                description: "Schreibstrategien, Erörterung, Kommentar, Essay.",
                examples: "Stellungnahme schreiben, Blogbeitrag",
                exam: "Abiturklausur 'Erörterung mit Material'",
                difficulty: "mittel",
                lkOnly: false
            }
        ]
    },
    Englisch: {
        icon: "🇬🇧",
        topics: [
            {
                id: "e1",
                title: "Grammatik & Wortschatz",
                description: "Zeiten (Simple Past, Present Perfect), Passive, Modalverben.",
                examples: "Bildung des Passivs, unregelmäßige Verben",
                exam: "Grammatik-Klausur, Lückentexte",
                difficulty: "mittel",
                lkOnly: false
            },
            {
                id: "e2",
                title: "Mediation",
                description: "Zusammenfassung und Übertragung von Texten (DE↔EN).",
                examples: "Textzusammenfassung, Sinngemäßes Übersetzen",
                exam: "Mediation Task im Abitur",
                difficulty: "schwer",
                lkOnly: false
            },
            {
                id: "e3",
                title: "Global Issues",
                description: "Texte über Globalisierung, Klimawandel, Kultur (UK/USA).",
                examples: "Artikel über Brexit, Klimawandel, Cultural Diversity",
                exam: "Kommentar oder Zusammenfassung zu aktuellem Thema",
                difficulty: "mittel",
                lkOnly: false
            }
        ]
    },
    Geschichte: {
        icon: "🏛️",
        topics: [
            {
                id: "h1",
                title: "Industrialisierung",
                description: "Entstehung Sozialismus, Kaiserreich, politische Reformen.",
                examples: "Industrielle Revolution, Soziale Frage",
                exam: "Ursachen und Folgen der Industrialisierung",
                difficulty: "mittel",
                lkOnly: false
            },
            {
                id: "h2",
                title: "Weimar & NS-Zeit",
                description: "Weimarer Demokratie, Nationalsozialismus, Diktaturmechanismen.",
                examples: "Weimarer Verfassung, Ermächtigungsgesetz",
                exam: "Analyse von Gesetzestexten und Propaganda",
                difficulty: "schwer",
                lkOnly: false
            },
            {
                id: "h3",
                title: "BRD und DDR",
                description: "Teilung Deutschlands, Mauerbau, Wiedervereinigung.",
                examples: "Ostpolitik, Alltag in DDR vs. BRD",
                exam: "Vergleich der politischen Systeme",
                difficulty: "mittel",
                lkOnly: false
            }
        ]
    },
    Geographie: {
        icon: "🌍",
        topics: [
            {
                id: "geo1",
                title: "Geodynamische Prozesse",
                description: "Plattentektonik, Erdbeben, Vulkanismus, Gebirgsentstehung.",
                examples: "Entstehung der Alpen, Subduktionszonen",
                exam: "Ursachen von Naturkatastrophen",
                difficulty: "mittel",
                lkOnly: false
            },
            {
                id: "geo2",
                title: "Wetter & Klima",
                description: "Luftdruck, Windsysteme, Klimadiagramme, Klimawandel.",
                examples: "Tiefdruckgebiete, CO₂-Konzentration",
                exam: "Klimawandel-Indikatoren und Folgen",
                difficulty: "mittel",
                lkOnly: false
            },
            {
                id: "geo3",
                title: "Stadtentwicklung",
                description: "Urbanisierung, Suburbanisierung, Stadtstrukturen in Deutschland.",
                examples: "Wachstum Leipzig, Megastädte",
                exam: "Stadtplanung und Wohnungsbaupolitik",
                difficulty: "mittel",
                lkOnly: false
            }
        ]
    },
    Gemeinschaftskunde: {
        icon: "⚖️",
        topics: [
            {
                id: "g1",
                title: "Internationale Politik",
                description: "Globalisierung, UNO, EU, Weltpolitik.",
                examples: "Europäische Union, Klimaverhandlungen",
                exam: "Weltpolitik (z.B. UN-Sicherheitsrat)",
                difficulty: "mittel",
                lkOnly: false
            },
            {
                id: "g2",
                title: "Wirtschaft in DE/EU",
                description: "Soziale Marktwirtschaft, Euro-Krise, Freihandel.",
                examples: "Arbeitslosigkeit und Globalisierung",
                exam: "Wirtschaftsdiagramme interpretieren",
                difficulty: "mittel",
                lkOnly: false
            },
            {
                id: "g3",
                title: "Politische Grundordnung",
                description: "Demokratieprinzip, Grundgesetz, Gewaltenteilung.",
                examples: "GG-Artikel (z.B. Artikel 20), Staatsbürgerrechte",
                exam: "Verfassungsrecht und Demokratieprinzip",
                difficulty: "schwer",
                lkOnly: false
            }
        ]
    },
    Ethik: {
        icon: "🕊️",
        topics: [
            {
                id: "r1",
                title: "Mensch und Moral",
                description: "Anthropologie, Glücksethik (Aristoteles), Utilitarismus.",
                examples: "Eudaimonia vs. größtes Glücks-Prinzip",
                exam: "Ethikaufgabe 'Was ist der Mensch?'",
                difficulty: "einfach",
                lkOnly: false
            },
            {
                id: "r2",
                title: "Ethische Debatten",
                description: "Sterbehilfe, Tierethik, Umweltethik, Klimaschutz.",
                examples: "Pro- und Contra-Argumente zu aktuellen Debatten",
                exam: "Argumentative Erörterung (Ethikabitur)",
                difficulty: "schwer",
                lkOnly: false
            },
            {
                id: "r3",
                title: "Glaube und Wissenschaft",
                description: "Schöpfung vs. Evolution, Theodizeefrage (Leid).",
                examples: "Kreationismus vs. Evolutionstheorie",
                exam: "Religionsabitur 'Glaubensfragen und Ethik'",
                difficulty: "mittel",
                lkOnly: false
            }
        ]
    }
};

module.exports = CURRICULUM;