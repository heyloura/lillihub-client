function growTextArea(el) {
    el.parentNode.dataset.replicatedValue = el.value;
}

function clearReply(el) {
    let form=el;
    setTimeout(
        function(){
            form.children[2].dataset.replicatedValue = ''; form.children[2].children[0].value = '';
        }, 250);
    document.getElementById('toast').style.display = 'block';
}

function showIframeResult() {
    document.getElementById('toast').style.display = 'block';
}

function collapse(el) {
    el.removeAttribute("open");
    el.classList.remove("closing");
}

function waitForScroll(el) {
    el.classList.add("closing");
    window.setTimeout(collapse, 500, el);
}

function liveSearch(selector, searchboxId) {
    let cards = document.querySelectorAll(selector)
    let search_query = document.getElementById(searchboxId).value;
    for (var i = 0; i < cards.length; i++) {
        if(cards[i].innerText.toLowerCase().includes(search_query.toLowerCase())) {
            cards[i].classList.remove("d-hide");
        } else {
            cards[i].classList.add("d-hide");
        }
    }
}

function addLoading(elem) {
    //elem.classList.add("loading");
    document.body.insertAdjacentHTML('afterbegin', `<div id="loader" class="overlay"><span class="loading d-block p-centered"></span></div>`)
}

function toggleCard(card) {
    card.parentNode.parentNode.classList.toggle('expanded'); // Toggle the 'expanded' class//card.classList.add('fadeout');
    card.parentNode.parentNode.classList.toggle('fadeout');
}

function toggleSummary(el, e) {
    // at some point find all the references and remove them
}

async function loadConversation(el, id) {
    const fetching = await fetch(`/conversation/${id}`, { method: "GET" } );
    try {
        const result = await fetching.text();
        el.insertAdjacentHTML(
            'afterend',
            result,
          );
    }
    catch {
        return null;
    }
}


const events = ["pagehide", "pageshow", "unload", "load"];

const eventLogger = (event) => {
  switch (event.type) {
    case "pagehide":
    case "pageshow": {
      let isPersisted = event.persisted ? "persisted" : "not persisted";
      console.log(`Event: ${event.type} - ${isPersisted}`);

      const loader = document.getElementById('loader');
      if(loader) {
        loader.remove();
      }

      break;
    }
    default:
      console.log(`Event: ${event.type}`);
      break;
  }
};

events.forEach((eventName) => window.addEventListener(eventName, eventLogger));

document.addEventListener("click", async (event) => {
    if(!event.target.getAttribute('evt-click')) {
        return;
    } else {
        if(event.target.getAttribute('evt-click') == 'show-menu') {
            document.getElementById('sidebar-menu').classList.toggle('hide-sm');
            document.getElementById('main-content').classList.toggle('hide-sm');
            document.getElementById('show-menu-button').classList.toggle('btn-link');
        }
    }
});