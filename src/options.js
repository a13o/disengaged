/* global browser */


// ## Local State

/** @type {OptionsConfig} */
let model = null;

/** @type {string[]} */
const toAdd = [];

/** @type {string[]} */
const toRemove = [];


// ## Entry Point

(function main() {
  browser.runtime.sendMessage({
    msg: 'GET v1/options/config',
  }).then((response) => {
    model = response;
    buildDocument();
  });
}());


// ## Listeners

function onSave() {
  if (toRemove.length) {
    browser.permissions.remove({
      origins: toRemove,
    });
    toRemove.length = 0;
  }

  if (toAdd.length) {
    // todo: when the request is rejected by the user, page gets out of sync
    browser.permissions.request({
      origins: toAdd,
    }).then((granted) => {
      if (!granted) { return; }
      toAdd.length = 0;
      updateSaveAbility();
    });
  } else {
    updateSaveAbility();
  }
}

function onChange(event) {
  const $checkbox = event.currentTarget;
  updateChangeset($checkbox);
  updateSaveAbility();
}

function onCheckAll() {
  const $permissions = document.getElementById('permissions');
  const $checkboxes = $permissions.querySelectorAll('input[type="checkbox"]') || [];

  $checkboxes.forEach(($checkbox) => {
    if ($checkbox.checked) { return; }
    $checkbox.checked = true;
    updateChangeset($checkbox);
  });

  updateSaveAbility();
}


// ## Helper Functions

function buildDocument() {
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
  $save.disabled = true;
  $save.addEventListener('click', onSave);

  const $checkAll = document.getElementById('check-all');
  $checkAll.addEventListener('click', onCheckAll);
}

function updateChangeset($checkbox) {
  const site = model.sites.find(site => site.id === $checkbox.dataset.site);

  const insertArr = $checkbox.checked ? toAdd : toRemove;
  const unsavedArr = $checkbox.checked ? toRemove : toAdd;

  const unsavedIdx = unsavedArr.indexOf(site.permission);
  if (unsavedIdx >= 0) {
    unsavedArr.splice(unsavedIdx, 1);
  } else {
    insertArr.push(site.permission);
  }
  console.log(unsavedArr, insertArr);
}

function updateSaveAbility() {
  const $save = document.getElementById('save');
  $save.disabled = (toAdd.length === 0 && toRemove.length === 0);
}
