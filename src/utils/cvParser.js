// CV Parser Utility
// Extracts structured text content from CV HTML for AI analysis
// Maps text content back to original locations for precise modifications

/**
 * Parse CV HTML and extract text content with location info
 * @param {string} html - The CV HTML string
 * @returns {object} Parsed CV structure with text content
 */
export function parseCvToText(html) {
    // Create a temporary DOM to parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const result = {
        profile: extractProfile(doc),
        experience: extractExperience(doc),
        skills: extractSkills(doc),
        certifications: extractCertifications(doc),
        projects: extractProjects(doc),
        raw: html
    };

    return result;
}

/**
 * Extract profile/tagline text
 */
function extractProfile(doc) {
    const tagline = doc.querySelector('.tagline');
    if (!tagline) return null;

    return {
        text: normalizeText(tagline.textContent),
        originalText: tagline.textContent.trim()
    };
}

/**
 * Extract experience/jobs
 */
function extractExperience(doc) {
    const jobs = [];
    const jobItems = doc.querySelectorAll('.job-item');

    jobItems.forEach((job, index) => {
        // Get company/role info
        const company = job.querySelector('.company, .job-company');
        const role = job.querySelector('.role, .job-title');
        const date = job.querySelector('.date, .job-date');
        const description = job.querySelector('.job-content p, .job-description');

        // Get bullet points
        const bullets = [];
        const bulletItems = job.querySelectorAll('.job-highlights li');
        bulletItems.forEach((li, bulletIndex) => {
            bullets.push({
                text: normalizeText(li.textContent),
                originalText: li.textContent.trim(),
                index: bulletIndex
            });
        });

        jobs.push({
            index,
            company: company?.textContent.trim() || '',
            role: role?.textContent.trim() || '',
            date: date?.textContent.trim() || '',
            description: description ? normalizeText(description.textContent) : '',
            bullets
        });
    });

    return jobs;
}

/**
 * Extract skills
 */
function extractSkills(doc) {
    const skills = [];

    // Try different skill container patterns
    const skillsList = doc.querySelector('.skills-list');
    if (skillsList) {
        skillsList.querySelectorAll('li').forEach(li => {
            skills.push({
                text: normalizeText(li.textContent),
                originalText: li.textContent.trim()
            });
        });
    }

    // Skills grid pattern (custom CV)
    const skillCells = doc.querySelectorAll('.skill-cell');
    skillCells.forEach(cell => {
        const category = cell.querySelector('.skill-category')?.textContent.trim();
        const list = cell.querySelector('.skill-list')?.textContent.trim();
        if (list) {
            skills.push({
                category,
                text: normalizeText(list),
                originalText: list
            });
        }
    });

    return skills;
}

/**
 * Extract certifications
 */
function extractCertifications(doc) {
    const certs = [];
    const certList = doc.querySelector('.cert-list');

    if (certList) {
        certList.querySelectorAll('li').forEach(li => {
            certs.push({
                text: normalizeText(li.textContent),
                originalText: li.textContent.trim()
            });
        });
    }

    return certs;
}

/**
 * Extract projects
 */
function extractProjects(doc) {
    const projects = [];
    const projectCards = doc.querySelectorAll('.project-card');

    projectCards.forEach(card => {
        const name = card.querySelector('.project-name')?.textContent.trim();
        const tech = card.querySelector('.project-tech')?.textContent.trim();
        const desc = card.querySelector('.project-desc')?.textContent.trim();

        if (name) {
            projects.push({
                name,
                tech,
                description: desc ? normalizeText(desc) : '',
                originalDescription: desc
            });
        }
    });

    return projects;
}

/**
 * Normalize text for comparison (remove extra whitespace)
 */
function normalizeText(text) {
    return text.replace(/\s+/g, ' ').trim();
}

/**
 * Generate a text-only representation for AI analysis
 * This is what we send to the AI instead of raw HTML
 */
export function generateTextRepresentation(parsed) {
    let text = '';

    // Profile
    if (parsed.profile) {
        text += `## PROFILE\n${parsed.profile.text}\n\n`;
    }

    // Experience
    if (parsed.experience.length > 0) {
        text += `## EXPERIENCE\n`;
        parsed.experience.forEach(job => {
            text += `\n### ${job.company} - ${job.role} (${job.date})\n`;
            if (job.description) {
                text += `${job.description}\n`;
            }
            job.bullets.forEach((bullet, i) => {
                text += `• ${bullet.text}\n`;
            });
        });
        text += '\n';
    }

    // Skills
    if (parsed.skills.length > 0) {
        text += `## SKILLS\n`;
        parsed.skills.forEach(skill => {
            if (skill.category) {
                text += `${skill.category}: ${skill.text}\n`;
            } else {
                text += `• ${skill.text}\n`;
            }
        });
        text += '\n';
    }

    // Certifications
    if (parsed.certifications.length > 0) {
        text += `## CERTIFICATIONS\n`;
        parsed.certifications.forEach(cert => {
            text += `• ${cert.text}\n`;
        });
        text += '\n';
    }

    // Projects
    if (parsed.projects.length > 0) {
        text += `## PROJECTS\n`;
        parsed.projects.forEach(project => {
            text += `\n### ${project.name}`;
            if (project.tech) text += ` (${project.tech})`;
            text += '\n';
            if (project.description) {
                text += `${project.description}\n`;
            }
        });
    }

    return text;
}

export default { parseCvToText, generateTextRepresentation };
