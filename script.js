(() => {
  document.addEventListener('DOMContentLoaded', async () => {

    // add "#1670504560206" in URL to search particular client, where value in quotation marks is ID
    window.addEventListener('hashchange', () => {
      if (window.location.hash) openChangeModal(window.location.hash.replace('#', ''));
    });

    // show or hide custom placeholder
    const inputs = document.querySelectorAll('.form-client__input');
    inputs.forEach((elem) => {
      elem.addEventListener('blur', () => {
        if (elem.value)
          document.querySelector(`[data-placeholder = ${elem.id}]`).style.display = 'none';
        else document.querySelector(`[data-placeholder = ${elem.id}]`).style.display = 'inline-block';
      });
      elem.addEventListener('focus', () => {
        document.querySelector(`[data-placeholder = ${elem.id}]`).style.display = 'none';
        elem.style.backgroundColor = 'unset';
      });
    });

    function closeModal(modal) {
      modal.style.display = 'none';
      document.querySelectorAll('.warning').forEach((el) => {
        el.remove();
      });
      document.querySelectorAll('.modal-contact-list').forEach((el) => {
        el.innerHTML = '';
      });
      inputs.forEach((el) => {
        el.style.backgroundColor = 'unset';
      });
      window.location.hash = '';
    }

    // modals. Common part
    document.querySelectorAll('.modal-dialog').forEach((elem) => {
      elem.addEventListener('click', (event) => {
        event._clickWithinModal = true;
      });
    });
    document.querySelectorAll('.modal').forEach((elem) => {
      elem.addEventListener('click', (event) => {
        if (event._clickWithinModal) return;
        closeModal(elem);
      });
    });
    document.querySelectorAll('.js-close-modal').forEach(elem => {
      elem.addEventListener('click', () => {
        closeModal(document.getElementById(`${elem.dataset.closemodal}`));
      });
    });

    function byField(field, direction) {
      if (direction === 'up') return (a, b) => a[field] < b[field] ? 1 : -1
      return (a, b) => a[field] > b[field] ? 1 : -1;
    }

    async function addClient(client) {
      const response = await fetch('http://localhost:5000/api/client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: client.name,
          surname: client.surname,
          lastName: client.lastName,
          contacts: client.contacts,
        })
      });
      if (response.ok) {
        await createTable().then(() => tippy('[data-tippy-content]'));
      }
      return {
        ok: response.ok,
        status: response.statusText,
      };
    }

    async function loadClients() {
      const response = await fetch('http://localhost:5000/api/clients', {
        method: 'GET',
      });
      return await response.json();
    }

    async function deleteClient(clientId) {
      await fetch(`http://localhost:5000/api/delete?id=${clientId}`,{
        method: 'DELETE',
      });
      await createTable();
    }

    async function getClient(clientId) {
      const response = await fetch(`http://localhost:5000/api/id?id=${clientId}`,{
        method: 'GET',
      });
      return await response.json();
    }

    async function changeClient(client, clientId) {
      await fetch(`http://localhost:5000/api/change?id=${clientId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${client.name}`,
          surname: `${client.surname}`,
          lastName: `${client.lastName}`,
          contacts: client.contacts,
        })
      });
      await createTable();
    }

    function toHtmlContacts(arr) {
      const contactList = document.createElement('ul');
      if (!arr) return contactList;
      contactList.classList.add('contact-list');

      const total = arr.length > 5 ? 4 : arr.length;
      for (let i = 0; i < arr.length; i++) {
        const listItem = document.createElement('li');
        const icon = document.createElement('img');
        const popUpBtn = document.createElement('button');
        popUpBtn.classList.add('pop-up-btn');
        listItem.classList.add('contacts-list-item');

        switch (arr[i].type) {
          case 'Телефон':
            icon.src = 'img/phone.svg';
            popUpBtn.setAttribute('data-tippy-content', `Тел: ${arr[i].value}`);
            break;
          case 'Вконтакте':
            icon.src = 'img/vk.svg';
            popUpBtn.setAttribute('data-tippy-content', `ВК: ${arr[i].value}`);
            break;
          case 'Почта':
            icon.src = 'img/mail.svg';
            popUpBtn.setAttribute('data-tippy-content', `Email: ${arr[i].value}`);
            break;
          case 'Facebook':
            icon.src = 'img/fb.svg';
            popUpBtn.setAttribute('data-tippy-content', `Facebook: ${arr[i].value}`);
            break;
          case 'Другое':
            icon.src = 'img/other.svg';
            popUpBtn.setAttribute('data-tippy-content', `Other: ${arr[i].value}`);
            break;
        }
        popUpBtn.appendChild(icon);
        listItem.appendChild(popUpBtn);
        contactList.appendChild(listItem);

        if (i >= total) {
          listItem.style.display = 'none';
        }
      }
      if (arr.length > 5) {
        const showMore = document.createElement('button');
        showMore.classList.add('show-more-contacts');
        showMore.textContent = `+${arr.length-4}`;
        showMore.addEventListener('click', () => {
          const children = showMore.parentElement.parentElement.children;
          for (let i = 0; i < children.length; i++) {
            children[i].style.display = 'inline-block';
          }
          showMore.parentElement.style.display = 'none';
        });
        const lI = document.createElement('li');
        lI.appendChild(showMore)
        lI.classList.add('contacts-list-item');
        contactList.appendChild(lI);
      }
      return contactList;
    }

    function parseDate(serverDate) {
      const date = serverDate.substring(0, 10).split('-').reverse().join('.');
      const time = serverDate.substring(11, 16);
      return {
        date: date,
        time: time,
      }
    }

    function addContact(modalListId, notTel = null) {
      const contact = document.createElement('li');
      const select = document.createElement('select');
      const optionTel = document.createElement('option');
      const optionVK = document.createElement('option');
      const optionMail = document.createElement('option');
      const optionOther = document.createElement('option');
      const contactInput = document.createElement('input');
      const deleteContact = document.createElement('button');
      const cancelImg = document.createElement('img');

      contact.classList.add('modal__contact-item');
      select.classList.add('contacts');
      select.id = 'contact-select';
      optionTel.classList.add('option');
      optionTel.textContent = 'Телефон';
      optionVK.classList.add('option');
      optionVK.textContent = 'Вконтакте';
      optionMail.classList.add('option');
      optionMail.textContent = 'Почта';
      optionOther.classList.add('option');
      optionOther.textContent = 'Другое';
      contactInput.classList.add('contact-input');
      contactInput.placeholder = 'Введите данные контакта';
      deleteContact.classList.add('delete-contact');
      cancelImg.src = 'img/cancel-white.svg';

      if (!notTel) Inputmask({"mask": "+7 (999) 999-9999"}).mask(contactInput);

      deleteContact.append(cancelImg);
      select.append(optionTel, optionVK, optionMail, optionOther);
      contact.append(select, contactInput, deleteContact);
      document.getElementById(modalListId).append(contact);

      select.addEventListener('change', () => {
        if (select.value === 'Телефон') {
          Inputmask({"mask": "+7 (999) 999-9999"}).mask(select.parentElement.children[1]);
        } else {
          const newInput = document.createElement('input')
          const deleteContact = document.createElement('button');
          deleteContact.classList.add('delete-contact');
          deleteContact.append(cancelImg);
          newInput.classList.add('contact-input');
          newInput.placeholder = 'Введите данные контакта';
          select.parentElement.children[1].remove();
          select.parentElement.children[1].remove();
          select.parentElement.append(newInput, deleteContact)
        }
      });

      deleteContact.addEventListener('click', () => {
        contact.remove();
      });
    }

    async function openChangeModal(ID) {
      document.getElementById('modal-change').style.display = 'block';
      const client = await getClient(ID);
      const nameInput = document.getElementById('change-client-name');
      const surnameInput = document.getElementById('change-client-surname');
      const lastnameInput = document.getElementById('change-client-lastname');
      nameInput.value = `${client.name}`;
      surnameInput.value = `${client.surname}`;
      if (!client.lastName) {
        document.querySelector('[data-placeholder = change-client-lastname]').style.display = 'block';
        lastnameInput.value = '';
      } else {
        lastnameInput.value = `${client.lastName}`;
      }
      document.getElementById('modal-change-id').textContent = `ID: ${ID}`;

      document
        .getElementById('delete-from-change-modal')
        .setAttribute('data-clientid', `${ID}`);
      document
        .getElementById('button-safe-changes')
        .setAttribute('data-clientid', `${ID}`);

      document.querySelectorAll('.place-holder').forEach(elem => {
        elem.style.display = 'none';
      });

      document.getElementById('contact-list-change').innerHTML = '';
      JSON.parse(client.contacts).forEach((contact) => {
        contact.type === 'Телефон' ?
          addContact('contact-list-change') : addContact('contact-list-change', true);
        const currContact = document.getElementById('contact-list-change').lastChild;
        for (let i = 0; i < currContact.children[0].length; i++) {
          if (currContact.children[0][i].textContent === `${contact.type}`) {
            currContact.children[0][i].selected = true;
            currContact.children[1].value = contact.value;
          }
        }
      });
    }

    async function createTable(clients = null) {
      const tableBody = document.getElementById('clients-body');
      tableBody.innerHTML = '';
      if (!clients) clients = await loadClients();
      clients.forEach(elem => {
        const row = document.createElement('tr');
        const id = document.createElement('th');
        const fullName = document.createElement('td');
        const regTime = document.createElement('td');
        const regTimeDate = document.createElement('span');
        const regTimeMin = document.createElement('span');
        const lastChange = document.createElement('td');
        const lastChangeDate = document.createElement('span');
        const lastChangeMin = document.createElement('span');
        const contacts = document.createElement('td');
        const actions = document.createElement('td');
        const btnChange = document.createElement('button');
        const btnDelete = document.createElement('button');
        const imgChange = document.createElement('img');
        const imgDelete = document.createElement('img');

        btnChange.id = 'open-modal-btn-change';
        btnChange.classList.add('actions-btn', 'change-btn', 'js-open-modal');
        btnChange.setAttribute('data-target', 'modal-change');
        btnChange.setAttribute('type', 'button');
        btnChange.setAttribute('data-clientId', `${elem.id}`)
        btnDelete.classList.add('actions-btn', 'delete-btn', 'js-open-modal');
        btnDelete.setAttribute('data-target', 'modal-delete');
        btnDelete.setAttribute('data-clientid', `${elem.id}`)
        btnDelete.setAttribute('type', 'button');

        imgChange.classList.add('actions-btn__img');
        imgChange.src = 'img/edit.svg';
        imgChange.setAttribute('alt', 'edit image');
        imgChange.style.display = 'inline-block';
        imgChange.style.marginBottom = '3px';
        imgDelete.classList.add('actions-btn__img');
        imgDelete.src = 'img/cancel.svg';
        imgDelete.setAttribute('alt', 'delete image');
        imgDelete.style.display = 'inline-block';
        imgDelete.style.marginBottom = '3px';

        btnChange.append(imgChange);
        btnChange.innerHTML += 'Изменить';
        btnDelete.append(imgDelete);
        btnDelete.innerHTML += 'Удалить';

        actions.append(btnChange, btnDelete);
        actions.classList.add('table_actions');

        id.setAttribute('scope', 'row');
        id.textContent = elem.id;
        id.classList.add('id-cell');
        fullName.textContent = `${elem.surname} ${elem.name} ${elem.lastName}`;
        regTime.classList.add('table-date');
        regTimeDate.textContent = parseDate(elem.createdAt).date;
        regTimeMin.textContent = parseDate(elem.createdAt).time;
        regTimeMin.classList.add('gray-text');
        lastChange.classList.add('table-date');
        lastChangeDate.textContent = parseDate(elem.updatedAt).date;
        lastChangeMin.textContent = parseDate(elem.updatedAt).time;
        lastChangeMin.classList.add('gray-text');
        regTime.append(regTimeDate, regTimeMin);
        lastChange.append(lastChangeDate, lastChangeMin);
        elem.contacts = JSON.parse(elem.contacts);
        contacts.appendChild(toHtmlContacts(elem.contacts));
        contacts.classList.add('table_contacts');

        row.append(id, fullName, regTime, lastChange, contacts, actions);
        tableBody.append(row);
      });

      // modal add client
      const openModalBtn = document.getElementById('open-modal-btn');
      const modal = document.getElementById(openModalBtn.dataset.target);
      openModalBtn.addEventListener('click', () => {
        modal.style.display = 'block';
        document.querySelectorAll('.place-holder').forEach((elem) => {
          elem.style.display = 'inline';
        });
        document.querySelectorAll('.form-client__input').forEach((elem) => {
          elem.value = '';
        });
      });

      // modal change client
      const openModalBtnsChangeClient = document.querySelectorAll('.change-btn');
      openModalBtnsChangeClient.forEach((elem) => {
        elem.addEventListener('click', async () => {
          window.location.hash = `${elem.dataset.clientid}`;
        });
      });

      // modal delete client
      const openModalBtnsDeleteClient = document.querySelectorAll('.delete-btn');
      openModalBtnsDeleteClient.forEach(elem => {
        const modalDeleteClient = document.getElementById(elem.dataset.target);
        elem.addEventListener('click', () => {
          modalDeleteClient.style.display = 'block';
          modalDeleteClient._clientId = elem.dataset.clientid;
        });
      });
    }

    const expectedStr = /^[а-яА-я ]*$/;

    function telToNumber(tel) {
      return tel.replace(/\D/g, "");
    }

    function validate(name, surname, contacts, lastname) {
      let flag = true;
      let warningSurname;
      let warningName;
      let wrongName;
      let wrongSurname;
      let wrongLastname;
      let wrongContact;

      if (!name.trim()) {
        warningName = document.createElement('span');
        document.getElementById('add-client-name').style.backgroundColor = '#f5c2c7';
        warningName.textContent = 'Поле ИМЯ является обязательным для заполнения';
        warningName.style.color = '#fa3628';
        warningName.classList.add('warning');
        flag = false;
      }
      if (!surname.trim()) {
        warningSurname = document.createElement('span');
        document.getElementById('add-client-surname').style.backgroundColor = '#f5c2c7';
        warningSurname.textContent = 'Поле ФАМИЛИЯ является обязательным для заполнения';
        warningSurname.style.color = '#fa3628';
        warningSurname.classList.add('warning');
        flag = false;
      }
      for (let i = 0; i < name.length; i++) {
        if (!expectedStr.test(name[i])) {
          wrongName = document.createElement('span');
          document.getElementById('add-client-name').style.backgroundColor = '#f5c2c7';
          wrongName.textContent = 'Имя может содержать только буквы русского алфавита';
          wrongName.style.color = '#fa3628';
          wrongName.classList.add('warning');
          flag = false;
        }
      }
      for (let i = 0; i < surname.length; i++) {
        if (!expectedStr.test(surname[i])) {
          wrongSurname = document.createElement('span');
          document.getElementById('add-client-surname').style.backgroundColor = '#f5c2c7';
          wrongSurname.textContent = 'Фамилия может содержать только буквы русского алфавита';
          wrongSurname.style.color = '#fa3628';
          wrongSurname.classList.add('warning');
          flag = false;
        }
      }
      for (let i = 0; i < lastname.length; i++) {
        if (!expectedStr.test(lastname[i])) {
          wrongLastname = document.createElement('span');
          document.getElementById('add-client-lastname').style.backgroundColor = '#f5c2c7';
          wrongLastname.textContent = 'Отчество может содержать только буквы русского алфавита';
          wrongLastname.style.color = '#fa3628';
          wrongLastname.classList.add('warning');
          flag = false;
        }
      }
      contacts.forEach((cont) => {
        if (!cont.value.trim() || ((cont.type === 'Телефон') && (telToNumber(cont.value).length<11))) {
          wrongContact = document.createElement('span');
          document.getElementById('add-client-lastname').style.backgroundColor = '#f5c2c7';
          wrongContact.textContent = 'Заполните все выбранные контакты!';
          wrongContact.style.color = '#fa3628';
          wrongContact.classList.add('warning');
          flag = false;
        }
      });
      if (warningName) document.querySelector(`[data-active = 'true']`).prepend(warningName);
      if (warningSurname) document.querySelector(`[data-active = 'true']`).prepend(warningSurname);
      if (wrongName) document.querySelector(`[data-active = 'true']`).prepend(wrongName);
      if (wrongSurname) document.querySelector(`[data-active = 'true']`).prepend(wrongSurname);
      if (wrongLastname) document.querySelector(`[data-active = 'true']`).prepend(wrongLastname);
      if (wrongContact) document.querySelector(`[data-active = 'true']`).prepend(wrongContact);
      return flag;
    }

    // add contact in any modal
    const addContactBtn = document.querySelectorAll('.button-add');
    addContactBtn.forEach((elem) => {
      elem.addEventListener('click', () => addContact(elem.dataset.modalcontact), true);
    })

    // confirm delete client
    document.getElementById('confirm-delete').addEventListener('click', () => {
      deleteClient(document.getElementById('modal-delete')._clientId)
        .then(() => tippy('[data-tippy-content]'));
      document.getElementById('modal-delete').style.display = 'none';
    });

    function parseName(dataString) {
      return dataString
        .split(' ')
        .filter((text) => text.length > 0)
        .map((str) => str.trim())
        .join('');
    }

    function parseContacts(htmlList) {
      const contacts = [];
      for (let i = 0; i < htmlList.length; i++) {
        const contactType = htmlList.item(i).children[0].value;
        const data = htmlList.item(i).children[1].value;
        contacts.push({
          type: contactType,
          value: data,
        });
      }
      return contacts;
    }

    function filter(input, clients) {
      const filteredArr = clients.reduce((result, curr) => {
        const fullName = curr.surname + curr.name + curr.surname;
        if (fullName.includes(input) ||
          (parseDate(curr.createdAt).date + parseDate(curr.createdAt).time).includes(input) ||
          (parseDate(curr.updatedAt).date + parseDate(curr.updatedAt).time).includes(input) ||
          curr.id.toString().includes(input)) {
            result.push(curr);
        }
        return result;
      }, []);
      createTable(filteredArr).then(() => tippy('[data-tippy-content]'));
    }

    // submit new client
    document
      .getElementById('form-new-client')
      .addEventListener('submit', async (event) => {
      event.preventDefault();
      const name = document.getElementById('add-client-name').value;
      const surname = document.getElementById('add-client-surname').value;
      const lastname = document.getElementById('add-client-lastname').value;
      const contacts = parseContacts(document.getElementById('contact-list-add').children)
      document.getElementById('add-footer').dataset.active = 'true';
      document.querySelectorAll('.warning').forEach((el) =>{
        el.remove();
      });

      if (validate(name, surname, contacts, lastname)) {
        const client = {
          name: parseName(name),
          surname: parseName(surname),
          lastName: parseName(lastname),
          contacts: contacts,
        }
        const response = await addClient(client);
        if (response.ok === true) closeModal(document.getElementById('modal'));
        else {
          const warningName = document.createElement('span');
          warningName.textContent = `${response.status}`;
          warningName.style.color = '#fa3628';
          warningName.classList.add('warning');
          document.querySelector(`[data-active = 'true']`).prepend(warningName);
        }
      }
    });


    // submit changes
    document
      .getElementById('form-change-client')
      .addEventListener('submit', async (event) => {
      event.preventDefault();
      const name = document.getElementById('change-client-name').value;
      const surname = document.getElementById('change-client-surname').value;
      const lastname = document.getElementById('change-client-lastname').value;
      const contacts = parseContacts(document.getElementById('contact-list-change').children);
      document.getElementById('change-footer').dataset.active = 'true';
      document.querySelectorAll('.warning').forEach((el) =>{
        el.remove();
      });

      if (validate(name, surname, contacts, lastname)) {
        const client = {
          name: parseName(name),
          surname: parseName(surname),
          lastName: parseName(lastname),
          contacts: contacts,
        }
        await changeClient(client, document.getElementById('button-safe-changes').dataset.clientid)
          .then(() => tippy('[data-tippy-content]'));
        closeModal(document.getElementById('modal-change'));
      }
    });

    // change arrow direction in table head
    document.querySelectorAll('.table-head-btn').forEach((elem) => {
      elem.addEventListener('click', async () => {
        let direction;
        if (elem.dataset.direction === 'true') {
          elem.firstElementChild.src = 'img/arrowDown.svg';
          elem.dataset.direction = 'false';
          direction = 'down';
        } else {
          elem.firstElementChild.src = 'img/arrowUp.svg';
          elem.dataset.direction = 'true';
          direction = 'up';
        }
        let clients = await loadClients();
        createTable(clients.sort(byField(elem.dataset.field, direction))).then(() => tippy('[data-tippy-content]'));
      });
    });

    // "find client" input
    let timeoutId;
    const inputFilter = document.getElementById('filter-input')
    inputFilter.addEventListener('input', async () => {
      const clients = await loadClients();
      clearTimeout(timeoutId);
      timeoutId = setTimeout(function () {
        filter(inputFilter.value, clients);
      }, 800);
    });

    document.querySelector('.lds-ring-wrapper').style.display = 'flex';
    let clients = await loadClients();
    createTable(clients.sort(byField('id', 'up'))).then(() => tippy('[data-tippy-content]'));
    document.querySelector('.lds-ring-wrapper').style.display = 'none';
  });
})();
