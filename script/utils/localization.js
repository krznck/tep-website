// Lightweight helpers for localized JSON content shared across pages.
// We attach them to window because modules aren’t available in this build setup.

(function attachLocalizationHelpers() {
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
    if (member.alumni) {
      if (lang === 'sv') {
        return `${member.degreeLevel} inom ${member.programName}, examen ${member.yearOfStudy}`;
      }
      return `${member.degreeLevel} in ${member.programName}, graduated ${member.yearOfStudy}`;
    }

    if (member.yearOfStudy === '-') {
      if (lang === 'sv') {
        return `${member.degreeLevel} på ${member.programName}`;
      }
      return `${member.degreeLevel} in ${member.programName}`;
    }
    
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
