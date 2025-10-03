// Lightweight helpers for localized JSON content shared across pages.
// We attach them to window because modules aren’t available in this build setup.

(function attachLocalizationHelpers() {
  // Traduções globais para labels
  window.globalTranslations = {
    en: {
      back_to_research: "← Back to research",
      elevator_pitch: "Elevator pitch",
      students: "Students",
      supervisor: "Supervisor",
      back_to_projects: "← Back to projects",
      overview: "Overview",
      key_outcomes: "Key Outcomes",
      project_team: "Project Team",
      meet_team: "Meet the TEP members who delivered this project."
    },
    sv: {
      back_to_research: "← Tillbaka till forskning",
      elevator_pitch: "Hisspresentation",
      students: "Studenter",
      supervisor: "Handledare",
      back_to_projects: "← Tillbaka till projekt",
      overview: "Översikt",
      key_outcomes: "Viktiga resultat",
      project_team: "Projektteam",
      meet_team: "Möt TEP-medlemmarna som levererade detta projekt."
    }
  };

  window.applyGlobalTranslations = function applyGlobalTranslations(lang) {
    const dict = window.globalTranslations[lang] || window.globalTranslations['en'];
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });
  };
  if (window.getCurrentLanguage) {
    return; // already defined
  }

  window.getCurrentLanguage = function getCurrentLanguage() {
    return document.documentElement.lang || 'en';
  };

  window.mergeLocalizedFields = function mergeLocalizedFields(base, lang) {
    if (!base || typeof base !== 'object') {
      return base;
    }

    const translations = base.translations;
    if (!translations || !translations[lang]) {
      return base;
    }

    const localized = { ...base, ...translations[lang] };

    // Arrays need a shallow copy when overridden to avoid mutating source data.
    if (translations[lang].focusAreas) {
      localized.focusAreas = [...translations[lang].focusAreas];
    }
    if (translations[lang].technologies) {
      localized.technologies = [...translations[lang].technologies];
    }
    if (translations[lang].outcomes) {
      localized.outcomes = [...translations[lang].outcomes];
    }

    return localized;
  };

  window.formatMemberAcademicInfo = function formatMemberAcademicInfo(member, lang) {
    if (lang === 'sv') {
      return `${member.degreeLevel} på ${member.programName}, år ${member.yearOfStudy}`;
    }
    return `${member.degreeLevel} in ${member.programName}, Year ${member.yearOfStudy}`;
  };

  window.formatProjectEmptyTeamMessage = function formatProjectEmptyTeamMessage(lang) {
    return lang === 'sv'
      ? 'Teammedlemmar läggs till snart.'
      : 'Team members will be added soon.';
  };

  window.formatProjectEmptyTeamBody = function formatProjectEmptyTeamBody(lang) {
    return lang === 'sv'
      ? 'Inga teammedlemmar är listade för det här projektet ännu.'
      : 'No team members listed for this project yet.';
  };

  window.formatMemberEmptyProjectsMessage = function formatMemberEmptyProjectsMessage(memberName, lang) {
    if (lang === 'sv') {
      return `${memberName} förbereder sig för att ansluta till nya initiativ.`;
    }
    return `${memberName} is getting ready to join new initiatives.`;
  };

  window.formatMemberEmptyProjectsBody = function formatMemberEmptyProjectsBody(lang) {
    return lang === 'sv'
      ? 'Inga offentliga projekt att visa ännu.'
      : 'No public projects to display yet.';
  };

  window.formatProjectCardCta = function formatProjectCardCta(lang) {
    return lang === 'sv' ? 'Visa projekt →' : 'View project →';
  };
})();
