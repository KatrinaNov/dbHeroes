'use strict';

const output = document.querySelector('.output');
const searchForm = document.querySelector('#search-form');

document.addEventListener('DOMContentLoaded', function () {
  fetch('./dbHeroes.json')
    .then(function (value) {
      if (value.status !== 200) {
        return Promise.reject(value);
      }
      return value.json();
    })
    .then(function (data) {
      let inner = '';
      // если ничего не найдено
      if (data.length === 0) {
        inner = '<h2 class="answer">По Вашему запросу ничего не найдено</h2>';
      }
      data.forEach(function (item) {
        let nameItem = item.name;
        // проверка пути у фото, если его нету или путь не верный, то ставим заглушку
        const regPhoto = /^dbimage\/.+\.(jpg|png|jpeg)$/;
        const poster = (item.photo && regPhoto.test(item.photo)) ? item.photo : './img/noposter.jpg';

        inner += `
          <div class="card">
            <div class="card-front">
              <img class="card-img" src='${poster}'>
              <div class="card-name">${nameItem}о</div>
            </div>
            <div class="card-back">
              <div class="card-text">Имя: ${item.name}</div>
              <div class="card-text">Настоящее имя: ${item.realName}</div>
              <div class="card-text">Раса: ${item.species}</div>
              <div class="card-text">Пол: ${item.gender}</div>
              <div class="card-text">Дата рождения: ${item.birthday}</div>
              <div class="card-text">Дата смерти: ${item.deathDay}</div>
              <div class="card-text">Актер: ${item.actors}</div>
              <div class="card-text">Гражданство: ${item.citizenship}</div>
              <div class="card-text">Статус: ${item.status}</div>
              <div class="card-text">Фильмы: ${item.movies}</div>
            </div>
          </div>
          `;
      });
      output.innerHTML = inner;

    })
    .catch(function (reason) {
      output.innerHTML = 'Упс ,что-то пошло не так!';
      console.error('error:' + reason.status);
    });
});