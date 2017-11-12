async function updatePersonOnServer(nodeData, csrf) {
  const headers = new Headers();
  headers.append('X-CSRF-Token', csrf);
  headers.append('Content-Type', 'application/json');

  const updatedDataForServer = Object.assign({ id: nodeData.ID }, nodeData);
  delete updatedDataForServer.ID;
  delete updatedDataForServer.children;

  const response = await fetch(`/family_members/${nodeData.ID}.json?account_id=${window.accountID}`, {
    method: 'PATCH',
    credentials: 'include',
    body: JSON.stringify({
      family_member: updatedDataForServer,
    }),
    headers,
  });
  const body = await response.json();
}

async function fetchFamilyMemberData() {
  const response = await fetch(`/family_members.json?account_id=${window.accountID}`);
  const jsonData = await response.json();
  return algo.compileTree(jsonData);
}

async function fetchGiftExchangeData() {
  const response = await fetch(`/gift_exchanges.json?account_id=${window.accountID}`);
  const jsonData = await response.json();
  return jsonData;
}

async function addPerson(personData, csrf) {
  debugger;
  const headers = new Headers();
  headers.append('X-CSRF-Token', csrf);
  headers.append('Content-Type', 'application/json');
  const personDataForServer = Object.assign({ parent_id: personData.parent }, personData);
  delete personDataForServer.parent;
  const response = await fetch(`/family_members.json?account_id=${window.accountID}`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({
      family_member: personDataForServer,
    }),
    headers,
  });
  const body = await response.json();
  return body;
}

async function removePerson(personID, csrf) {
  const headers = new Headers();
  headers.append('X-CSRF-Token', csrf);
  const response = await fetch(`/family_members/${personID}.json?account_id=${window.accountID}`, {
    method: 'DELETE',
    credentials: 'include',
    headers,
  });
}

async function saveGiftExchanges(exchanges, csrf, xmasYear) {
  const headers = new Headers();
  headers.append('X-CSRF-Token', csrf);
  headers.append('Content-Type', 'application/json');
  const response = await fetch(`/gift_exchanges.json?account_id=${window.accountID}`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({
      xmas_year: xmasYear,
      gift_exchanges: exchanges.map((exchangeData) => {
        return {
          gift_exchange: exchangeData,
        };
      })
    }),
    headers,
  });
  if (response.status !== 204) {
    throw new Error('Could not save gift exchanges');
  }
}

window.api = {
  updatePersonOnServer,
  fetchFamilyMemberData,
  fetchGiftExchangeData,
  addPerson,
  removePerson,
  saveGiftExchanges,
};
