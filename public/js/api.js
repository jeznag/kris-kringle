async function updatePersonOnServer(nodeData, csrf) {
  const headers = new Headers();
  headers.append('X-CSRF-Token', csrf);
  headers.append('Content-Type', 'application/json');

  const updatedDataForServer = Object.assign({
    family_member_type: nodeData.type,
    parent_id: nodeData.parent,
    participating_this_year: nodeData.participating.toString(),
  }, nodeData);
  delete updatedDataForServer.ID;
  delete updatedDataForServer.type;
  delete updatedDataForServer.parent;
  delete updatedDataForServer.children;
  delete updatedDataForServer.participating;

  await fetch(`/family_members/${nodeData.ID}.json?account_id=${window.accountID}`, {
    method: 'PATCH',
    credentials: 'include',
    body: JSON.stringify({
      family_member: updatedDataForServer,
    }),
    headers,
  });
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
  const headers = new Headers();
  headers.append('X-CSRF-Token', csrf);
  headers.append('Content-Type', 'application/json');
  const personDataForServer = Object.assign({ parent_id: personData.parent, participating_this_year: personData.participating }, personData);
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
          gift_exchange: Object.assign({ account_id: window.accountID }, exchangeData),
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
