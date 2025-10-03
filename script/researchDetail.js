document.addEventListener('DOMContentLoaded', () => {
    const lang = window.getCurrentLanguage ? window.getCurrentLanguage() : 'en';
    if (window.applyGlobalTranslations) window.applyGlobalTranslations(lang);
    loadResearchDetail();
});

async function loadResearchDetail() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const container = document.querySelector('.project-page');
    if (!id || !container) {
        container.innerHTML = '<p>Research not found.</p>';
        return;
    }
    try {
        const researchResponse = await fetch('/data/research.json');
        if (!researchResponse.ok) throw new Error('Failed to fetch research data');
        const researchList = await researchResponse.json();
        const research = researchList.find(r => String(r.id) === id);
        if (!research) {
            container.innerHTML = '<p>Research not found.</p>';
            return;
        }

    // Fetch member data
        const membersResponse = await fetch('/data/members.json');
        if (!membersResponse.ok) throw new Error('Failed to fetch members data');
        const membersList = await membersResponse.json();

    // Replace students with complete member data
        if (Array.isArray(research.students)) {
            research.students = research.students.map(student => {
                // If id is present, fetch by id
                let member = null;
                if (student.id) {
                    member = membersList.find(m => String(m.id) === String(student.id));
                } else if (student.slug) {
                    member = membersList.find(m => m.slug === student.slug);
                } else if (student.name) {
                    member = membersList.find(m => m.name === student.name);
                }
                if (member) {
                    return {
                        name: member.name,
                        slug: member.slug || '',
                        image: member.photo || 'assets/members_pic/user-placeholder.jpg',
                        description: member.title || ''
                    };
                } else {
                    // fallback to data from research.json
                    return {
                        name: student.name,
                        slug: student.slug || '',
                        image: student.image || 'assets/members_pic/user-placeholder.jpg',
                        description: student.description || ''
                    };
                }
            });
        }
        renderResearchDetail(research, container);
    } catch (error) {
        container.innerHTML = '<p>Error loading research details.</p>';
    }
}

function renderResearchDetail(research, container) {
    const lang = window.getCurrentLanguage ? window.getCurrentLanguage() : 'en';
    const localized = window.mergeLocalizedFields ? window.mergeLocalizedFields(research, lang) : research;
    container.querySelector('#research-image').src = localized.image;
    container.querySelector('#research-image').alt = localized.title;
    // Title translation
    if (lang === 'sv' && research.translations && research.translations.sv && research.translations.sv.title) {
        container.querySelector('#research-title').textContent = research.translations.sv.title;
    } else {
        container.querySelector('#research-title').textContent = localized.title;
    }
    // Category translation
    if (lang === 'sv' && research.translations && research.translations.sv && research.translations.sv.category) {
        container.querySelector('#research-category').textContent = research.translations.sv.category;
    } else {
        container.querySelector('#research-category').textContent = localized.category;
    }
    container.querySelector('#research-date').textContent = localized.date;
    // Description translation
    const descriptionElem = document.createElement('p');
    if (lang === 'sv' && research.translations && research.translations.sv && research.translations.sv.description) {
        descriptionElem.textContent = research.translations.sv.description;
    } else {
        descriptionElem.textContent = localized.description || '';
    }
    // Add description before elevator pitch
    const overviewSections = container.querySelectorAll('.project-overview');
    if (overviewSections.length > 0) {
        overviewSections[0].appendChild(descriptionElem);
    }
    // Elevator pitch translation
    if (lang === 'sv' && research.translations && research.translations.sv && research.translations.sv.elevator) {
        container.querySelector('#research-elevator').textContent = research.translations.sv.elevator;
    } else {
        container.querySelector('#research-elevator').textContent = localized.elevator || 'No elevator pitch provided.';
    }
    // Remove background padding
    // Render students as clickable cards
    const studentsContainer = container.querySelector('#research-students');
    studentsContainer.innerHTML = '';
    // Center if there is only one student
    if (Array.isArray(localized.students) && localized.students.length === 1) {
        studentsContainer.classList.add('single-student');
    } else {
        studentsContainer.classList.remove('single-student');
    }
    if (Array.isArray(localized.students)) {
        localized.students.forEach(student => {
            const card = document.createElement('div');
            card.className = 'student-card';
            card.onclick = () => {
                window.location.href = `member.html?slug=${student.slug}`;
            };
            const photo = document.createElement('img');
            photo.src = student.image || 'assets/members_pic/user-placeholder.jpg';
            photo.alt = student.name;
            card.appendChild(photo);
            const body = document.createElement('div');
            body.className = 'student-card-body';
            const name = document.createElement('span');
            name.className = 'student-name';
            name.textContent = student.name;
            body.appendChild(name);
            // Member title translation
            let memberTitle = student.description;
            if (lang === 'sv' && student.translations && student.translations.sv && student.translations.sv.title) {
                memberTitle = student.translations.sv.title;
            }
            if (memberTitle) {
                const desc = document.createElement('span');
                desc.className = 'student-desc';
                desc.textContent = memberTitle;
                body.appendChild(desc);
            }
            card.appendChild(body);
            studentsContainer.appendChild(card);
        });
    } else if (typeof localized.students === 'string') {
        studentsContainer.textContent = localized.students;
    }
    container.querySelector('#research-supervisor').textContent = localized.supervisor || 'No supervisor listed.';
}
