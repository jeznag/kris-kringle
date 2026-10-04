const JSON_HEADERS = { 'Content-Type': 'application/json' };
const HTTP_NO_CONTENT = 204;

function accountQuery() {
  return `account_id=${encodeURIComponent(window.accountID)}`;
}

async function updatePersonOnServer(nodeData) {
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

  await fetch(`/family_members/${nodeData.ID}.json?${accountQuery()}`, {
    method: 'PATCH',
    body: JSON.stringify({
      family_member: updatedDataForServer,
    }),
    headers: JSON_HEADERS,
  });
}

async function fetchFamilyMemberData() {
  const response = await fetch(`/family_members.json?${accountQuery()}`);
  const jsonData = await response.json();
  return algo.compileTree(jsonData);
}

async function fetchGiftExchangeData() {
  const response = await fetch(`/gift_exchanges.json?${accountQuery()}`);
  return response.json();
}

async function addPerson(personData) {
  const personDataForServer = Object.assign({
    parent_id: personData.parent,
    family_member_type: personData.type,
    participating_this_year: personData.participating,
  }, personData);
  delete personDataForServer.parent;
  delete personDataForServer.type;
  const response = await fetch(`/family_members.json?${accountQuery()}`, {
    method: 'POST',
    body: JSON.stringify({
      family_member: personDataForServer,
    }),
    headers: JSON_HEADERS,
  });
  return response.json();
}

async function removePerson(personID) {
  await fetch(`/family_members/${personID}.json?${accountQuery()}`, {
    method: 'DELETE',
  });
}

async function saveGiftExchanges(exchanges, xmasYear) {
  const response = await fetch(`/gift_exchanges.json?${accountQuery()}`, {
    method: 'POST',
    body: JSON.stringify({
      xmas_year: xmasYear,
      gift_exchanges: exchanges.map((exchangeData) => ({ gift_exchange: exchangeData })),
    }),
    headers: JSON_HEADERS,
  });
  if (response.status !== HTTP_NO_CONTENT) {
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
