/* global browser */

(function main() {
  // todo: get this from the background script
  const model = {
    sites: [
      {
        id: 'Hacker News',
        displayName: 'Hacker News',
        permission: '*://*.news.ycombinator.com/*',
      },
      {
        id: 'Twitter',
        displayName: 'Twitter',
        permission: '*://*.twitter.com/*',
      },
      {
        id: 'YouTube',
        displayName: 'YouTube',
        permission: '*://*.youtube.com/*',
      },
      {
        id: 'YouTube Gaming',
        displayName: 'YouTube Gaming',
        permission: '*://*.gaming.youtube.com/*',
      },
      {
        id: 'YouTube Music',
        displayName: 'YouTube Music',
        permission: '*://*.music.youtube.com/*',
      },
      {
        id: 'Reddit',
        displayName: 'Reddit',
        permission: '*://*.reddit.com/r/*',
      },
    ],
  };

  const toAdd = [];
  const toRemove = [];

  const $permissions = document.getElementById('permissions');

  let i = 1;
  model.sites.forEach((site) => {
    const id = `permission_${i++}`;

    const $li = document.createElement('li');
    $permissions.appendChild($li);
    
    const $checkbox = document.createElement('input');
    $checkbox.id = id;
    $checkbox.type = 'checkbox';
    $li.appendChild($checkbox);

    const $label = document.createElement('label');
    $label.setAttribute('for', id);
    $label.textContent = `${site.displayName} (${site.permission})`;
    $li.appendChild($label);

    browser.permissions.contains({
      origins: [site.permission],
    }).then((approved) => {
      $checkbox.checked = approved;
      $checkbox.dataset.site = site.id;
      $checkbox.addEventListener('change', onChange);
    });
  });

  const $save = document.getElementById('save');
  $save.addEventListener('click', onSave);

  function onSave() {
    if (toAdd.length) {
      browser.permissions.request({
        origins: toAdd,
      });
      toAdd.length = 0;
    }
    
    if (toRemove.length) {
      browser.permissions.remove({
        origins: toRemove,
      });
      toRemove.length = 0;
    }
  }

  function onChange(event) {
    const $checkbox = event.currentTarget;
    const site = model.sites.find(site => site.id === $checkbox.dataset.site);

    const insertArr = $checkbox.checked ? toAdd : toRemove;
    const unsavedArr = $checkbox.checked ? toRemove : toAdd;

    const unsavedIdx = unsavedArr.indexOf(site.permission);
    if (unsavedIdx >= 0) {
      unsavedArr.splice(unsavedIdx, 1);
    } else {
      insertArr.push(site.permission);
    }
  }
}());
