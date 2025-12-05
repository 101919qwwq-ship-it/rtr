INSERT INTO droids (name, type, manufacturer, year_production, status) VALUES
('R2-D2', 'Astromech', 'Industrial Automaton', 1977, 'active'),
('C-3PO', 'Protocol', 'Cybot Galactica', 1977, 'active')
ON CONFLICT DO NOTHING;
