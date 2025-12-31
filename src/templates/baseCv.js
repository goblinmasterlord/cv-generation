// Base CV Template for Lilla Mocsonoky
// Sharp Editorial design with improved spacing, refined additional section, and creative header

export const baseCvTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lilla Mocsonoky - Energy & Carbon Consultant</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
            --color-text-main: #1A1A1A;
            --color-text-secondary: #4A4A4A;
            --color-text-muted: #777777;
            --color-accent: #C4785E;
            --color-accent-light: #E8D5CF;
            --color-sage: #5A6356;
            --color-border: #E5E5E5;
            --color-bg-subtle: #FAFAFA;
            --color-bg-accent: #FAF5F4;
            --font-sans: 'Geist', -apple-system, BlinkMacSystemFont, sans-serif;
            --font-mono: 'Geist Mono', 'SF Mono', monospace;
        }

        body {
            font-family: var(--font-sans);
            background: #4A4A4A;
            color: var(--color-text-main);
            line-height: 1.5;
            -webkit-font-smoothing: antialiased;
            font-size: 9.5pt;
            display: flex;
            justify-content: center;
            min-height: 100vh;
            padding: 32px 0;
        }

        .page {
            background: white;
            width: 210mm;
            min-height: 297mm;
            padding: 16mm 18mm;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.25);
        }

        /* ============================================
           HEADER - Creative Asymmetric Design
           ============================================ */
        .header {
            margin-bottom: 24px;
            padding-bottom: 20px;
            border-bottom: 1px solid var(--color-text-main);
            position: relative;
        }

        /* Subtle left accent bar */
        .header::before {
            content: '';
            position: absolute;
            left: -18mm; /* Extended to edge of visual area */
            top: 0;
            bottom: 0;
            width: 4px;
            background: var(--color-accent);
        }

        .header-top {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 16px;
        }

        .name {
            font-size: 32pt;
            font-weight: 800;
            line-height: 0.9;
            letter-spacing: -0.03em;
            color: var(--color-text-main);
        }

        .title {
            font-family: var(--font-mono);
            font-size: 9pt;
            font-weight: 500;
            color: var(--color-sage);
            text-transform: uppercase;
            letter-spacing: 0.15em;
            text-align: right;
        }

        .tagline {
            font-size: 10pt;
            color: var(--color-text-secondary);
            line-height: 1.6;
            margin-bottom: 18px;
            max-width: 95%;
        }

        .contact-row {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
        }

        .contact-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-family: var(--font-mono);
            font-size: 8pt;
            color: var(--color-text-muted);
            text-decoration: none;
            padding-right: 12px;
            border-right: 1px solid var(--color-border);
        }

        .contact-item:last-child {
            border-right: none;
        }

        .contact-icon {
            width: 12px;
            height: 12px;
            stroke: var(--color-accent);
            stroke-width: 1.5;
            fill: none;
        }

        /* ============================================
           TWO COLUMN CONTENT
           ============================================ */
        .content {
            display: grid;
            grid-template-columns: 165px 1fr;
            gap: 32px;
        }

        .sidebar {
            display: flex;
            flex-direction: column;
            gap: 24px; /* Increased vertical rhythm */
        }

        .main-content {
            display: flex;
            flex-direction: column;
            gap: 20px; /* Increased vertical rhythm */
        }

        /* ============================================
           SECTIONS
           ============================================ */
        .section-title {
            font-size: 7.5pt;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            color: var(--color-text-main);
            margin-bottom: 12px;
            padding-bottom: 6px;
            border-bottom: 1px solid var(--color-border);
        }

        /* Education */
        .edu-item { margin-bottom: 12px; }

        .edu-school {
            font-weight: 700;
            font-size: 9.5pt;
            margin-bottom: 2px;
            line-height: 1.2;
        }

        .edu-degree {
            font-family: var(--font-mono);
            font-size: 8pt;
            color: var(--color-sage);
            margin-bottom: 8px;
        }

        .edu-details {
            list-style: none;
            font-size: 8.5pt;
            color: var(--color-text-secondary);
            line-height: 1.5;
        }

        .edu-details li {
            position: relative;
            padding-left: 12px;
            margin-bottom: 4px;
        }

        .edu-details li::before {
            content: '•';
            position: absolute;
            left: 0;
            color: var(--color-accent);
            font-weight: bold;
        }

        /* Certifications & Skills */
        .cert-list, .skills-list { list-style: none; }

        .cert-list li, .skills-list li {
            font-size: 8.5pt;
            line-height: 1.45;
            margin-bottom: 8px;
            padding-left: 12px;
            position: relative;
        }

        .cert-list li::before, .skills-list li::before {
            content: '';
            position: absolute;
            left: 0;
            top: 6px;
            width: 4px;
            height: 4px;
            background: var(--color-accent);
        }

        .cert-year {
            display: block;
            font-family: var(--font-mono);
            font-size: 7.5pt;
            color: var(--color-text-muted);
            margin-top: 2px;
        }

        /* Experience */
        .experience-section .section-title { margin-bottom: 18px; }

        .job-item {
            margin-bottom: 20px;
            page-break-inside: avoid;
        }

        .job-item:last-child { margin-bottom: 0; }

        .job-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 6px;
            border-bottom: 1px dashed var(--color-border);
            padding-bottom: 4px;
        }
        
        .job-role-company {
            display: flex;
            flex-direction: column;
        }

        .job-title {
            font-size: 8pt;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: var(--color-sage);
            margin-bottom: 2px;
        }

        .job-company {
            font-size: 11pt;
            font-weight: 700;
        }

        .job-date {
            font-family: var(--font-mono);
            font-size: 8pt;
            color: var(--color-text-muted);
            text-align: right;
        }

        .job-highlights {
            list-style: none;
            margin-top: 10px;
        }

        .job-highlights li {
            position: relative;
            padding-left: 16px;
            margin-bottom: 5px;
            font-size: 9pt;
            line-height: 1.5;
            color: var(--color-text-secondary);
        }

        .job-highlights li::before {
            content: '';
            position: absolute;
            left: 0;
            top: 7px;
            width: 4px;
            height: 4px;
            border: 1px solid var(--color-accent); /* Hollow square bullet */
        }

        /* NEW Additional Section Design */
        .job-additional {
            font-size: 8.5pt;
            color: var(--color-text-secondary);
            margin-top: 10px;
            background: var(--color-bg-accent);
            padding: 10px 14px;
            border-left: 2px solid var(--color-accent);
            font-style: normal;
        }
        
        .job-additional strong {
            font-family: var(--font-mono);
            font-size: 7.5pt;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--color-accent-dark);
            margin-right: 6px;
        }

        /* Print */
        @page { size: A4; margin: 0; }
        @media print {
            body { background: white; padding: 0; }
            .page { width: 100%; min-height: auto; box-shadow: none; padding: 16mm 18mm; }
            .header::before { left: -18mm; }
            .cv-change-highlight { background: none !important; border-bottom: none !important; }
        }

        /* Change Highlighting - Applied by AI when changes are made */
        .cv-change-highlight {
            background: rgba(196, 120, 94, 0.25);
            border-bottom: 2px solid var(--color-accent);
            padding: 0 2px;
            transition: background 0.3s ease;
        }
    </style>
</head>
<body>
    <div class="page">
        <!-- HEADER -->
        <header class="header">
            <div class="header-top">
                <h1 class="name">Lilla Mocsonoky</h1>
                <div class="title">Energy & Carbon Consultant</div>
            </div>
            <p class="tagline" data-tailorable="profile">
                Experienced Energy & Carbon Consultant with a passion for driving meaningful climate action through practical solutions, collaboration and data management. Strong background in carbon profiling, upskilling the workforce, stakeholder and team management, and supporting corporate carbon reduction strategy development. Ambitious to grow as a leader in sustainability and contribute to building a more resilient, low-carbon future.
            </p>
            <div class="contact-row">
                <a href="tel:+4407537914872" class="contact-item">
                    <svg class="contact-icon" viewBox="0 0 24 24">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    075 379 14872
                </a>
                <a href="mailto:mlilla456@gmail.com" class="contact-item">
                    <svg class="contact-icon" viewBox="0 0 24 24">
                        <rect x="2" y="4" width="20" height="16" rx="0"></rect>
                        <path d="M22 6L12 13 2 6"></path>
                    </svg>
                    mlilla456@gmail.com
                </a>
                <div class="contact-item">
                    <svg class="contact-icon" viewBox="0 0 24 24">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    Southampton, SO18 1PE
                </div>
            </div>
        </header>

        <!-- CONTENT -->
        <div class="content">
            <aside class="sidebar">
                <section class="section">
                    <h2 class="section-title">Education</h2>
                    <div class="edu-item">
                        <div class="edu-school">University of Southampton</div>
                        <div class="edu-degree">BSc Oceanography, 2019</div>
                        <ul class="edu-details">
                            <li>Environmental Impact Assessment</li>
                            <li>Survey planning & fieldwork</li>
                            <li>Lab skills (DNA extraction, PCR)</li>
                            <li>Data analysis (Arlequin, DnaSP)</li>
                            <li>MATLAB, ArcGIS, MS Office</li>
                        </ul>
                    </div>
                </section>

                <section class="section">
                    <h2 class="section-title">Certifications</h2>
                    <ul class="cert-list" data-tailorable="certifications">
                        <li>ISEP Practitioner Certificate<span class="cert-year">2025 - ongoing</span></li>
                        <li>IEMA Foundation Certificate<span class="cert-year">2024</span></li>
                        <li>MHFA Mental Health First Aid<span class="cert-year">2024</span></li>
                        <li>Data Analyst Bootcamp<span class="cert-year">2022</span></li>
                        <li>Practical Leadership Skills<span class="cert-year">2020</span></li>
                    </ul>
                </section>

                <section class="section">
                    <h2 class="section-title">Other Skills</h2>
                    <ul class="skills-list" data-tailorable="skills">
                        <li>Bilingual (Hungarian & English)</li>
                        <li>Full UK Driver's Licence</li>
                        <li>Community Volunteer</li>
                        <li>STEMCourage Mentor (2024)</li>
                        <li>Basic PV Sol Skills</li>
                    </ul>
                </section>
            </aside>

            <main class="main-content">
                <section class="section experience-section">
                    <h2 class="section-title">Work Experience</h2>

                    <article class="job-item" data-tailorable="experience">
                        <div class="job-header">
                            <div class="job-role-company">
                                <div class="job-title">Energy & Carbon Consultant</div>
                                <div class="job-company">BAE Systems Plc, Portsmouth</div>
                            </div>
                            <div class="job-date">Dec 2022 – Present</div>
                        </div>
                        <ul class="job-highlights">
                            <li>Delivery of product carbon profiling activities</li>
                            <li>Management of profiling activities; scoping, resource planning, scheduling, stakeholder and risk management</li>
                            <li>Process development for product carbon profiling and roadmapping</li>
                            <li>Upskilling workshops & training development and delivery</li>
                            <li>Social Value bid writing</li>
                            <li>Coordination of sector-wide ESOS compliance & business travel audit</li>
                        </ul>
                        <p class="job-additional">
                            <strong>Additional:</strong> Cultural Working Group, Business Travel WG, SHE Champion, SharePoint Manager, Mentoring
                        </p>
                    </article>

                    <article class="job-item" data-tailorable="experience">
                        <div class="job-header">
                            <div class="job-role-company">
                                <div class="job-title">Student Hub Supervisor</div>
                                <div class="job-company">University of Southampton</div>
                            </div>
                            <div class="job-date">Feb 2022 – Dec 2022</div>
                        </div>
                        <ul class="job-highlights">
                            <li>Line management of Student Support staff</li>
                            <li>Performance tracking, reporting and improvement</li>
                            <li>Resolving complex queries and complaints</li>
                            <li>Stakeholder management</li>
                            <li>Mentoring and training staff members</li>
                        </ul>
                    </article>

                    <article class="job-item" data-tailorable="experience">
                        <div class="job-header">
                            <div class="job-role-company">
                                <div class="job-title">Team Leader</div>
                                <div class="job-company">Igloo Energy, Southampton</div>
                            </div>
                            <div class="job-date">Jan 2021 – Jan 2022</div>
                        </div>
                        <ul class="job-highlights">
                            <li>Task and performance management</li>
                            <li>Reporting on system & team performance</li>
                            <li>Process development and improvement</li>
                            <li>Support with personal development and upskilling</li>
                        </ul>
                    </article>
                </section>
            </main>
        </div>
    </div>
</body>
</html>`;

export default baseCvTemplate;
