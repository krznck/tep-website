var htmlName = 'global-header'; // note: we can't just call it header, since that is already reserved in HTML

var structure = `
    <div class="header-wrapper">
        <header class="centered">
            <div class="container header__container">
                <a href="./index.html"><img class="header__logo-image" src="./assets/logo/Combined mark, black.png" width="200px" height="74px" alt="logo"></a>
                <div class="menu__container">
                    <div class="menu__wrapper" id="menu">
                        <div>
                            <span class="menu__line line-1"></span>
                            <span class="menu__line line-2"></span>
                            <span class="menu__line line-3"></span>
                        </div>
                    </div>
                    <nav>
                        <ul class="nav__items-con">
                            <li class="nav__item"><a href="./projects.html" data-lang="header-projects">Projects</a></li>
                            <li class="nav__item"><a href="./events.html" data-lang="header-events">Events</a></li>
                            <li class="nav__item"><a href="./about.html" data-lang="header-aboutUs">About Us</a></li>
                            <li class="header-line" aria-hidden="true"></li>
                            <li class="nav__language">
                                <div class="language-switcher" role="group" aria-label="Select site language">
                                    <button type="button" class="language-button is-active" data-language="en" data-lang="header-english">English</button>
                                    <button type="button" class="language-button" data-language="sv" data-lang="header-swedish">Swedish</button>
                                </div>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </header>
    </div>
    `;

class Header extends HTMLElement {
    constructor() {
      super();
  
      this.innerHTML = structure;
    }
  }
  
  customElements.define(htmlName, Header);
