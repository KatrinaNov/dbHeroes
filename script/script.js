'use strict';

const output = document.querySelector('.output');
const searchForm = document.querySelector('#search-form');
const moviesSelect = document.querySelector('#movies');
const filterForm = document.querySelector('.filter-form');

const render = data => {
  let inner = '';
  // если ничего не найдено
  if (data.length === 0) {
    inner = '<h2 class="answer">По Вашему запросу ничего не найдено</h2>';
  }
  const transformValue = (value) => {
    return value ? value : 'неизвестно';
  }
  data.forEach(function (item) {
    // проверка пути у фото, если его нету или путь не верный, то ставим заглушку
    const regPhoto = /^dbimage\/.+\.(jpg|png|jpeg)$/;
    const poster = (item.photo && regPhoto.test(item.photo)) ? item.photo : './img/noposter.jpg';
    // выводим дату смерти только если стоит статус Deceased и есть дата смерти
    const dateDeath = () => (item.status.toLowerCase() === 'deceased' && item.deathDay) ? `<div class="card-text">Дата смерти: ${item.deathDay}</div>` : '';
     
    inner += `
      <div class="card">
        <div class="card-front">
          <img class="card-img" src='${poster}'>
          <div class="card-name">${item.name}о</div>
        </div>
        <div class="card-back">
          <div class="card-text">Имя: ${item.name}</div>
          <div class="card-text">Настоящее имя: ${transformValue(item.realName)}</div>
          <div class="card-text">Раса: ${transformValue(item.species)}</div>
          <div class="card-text">Пол: ${transformValue(item.gender)}</div>
          <div class="card-text">Дата рождения: ${transformValue(item.birthday)}</div>
          ${dateDeath()}
          <div class="card-text">Актер: ${transformValue(item.actors)}</div>
          <div class="card-text">Гражданство: ${transformValue(item.citizenship)}</div>
          <div class="card-text">Статус: ${transformValue(item.status)}</div>
          <div class="card-text">Фильмы: ${transformValue(item.movies)}</div>
        </div>
      </div>
      `;  
      output.innerHTML = inner;
  
  });
};
// список фильмов
const movieList = data => {
  //коллекция фильмов без повторов
  let movieList = new Set();
  data.forEach(item => {
    if (item.movies) {
      item.movies.forEach(movie => movieList.add(movie.trim()));
    }
  });   
  // выводим список на страницу
  movieList.forEach(item => {
    const optionMovie = document.createElement('option');
    optionMovie.textContent = item;
    optionMovie.value = item;
    moviesSelect.append(optionMovie);
  });
};
// фильтр по выбранной радиокнопке
const filter = (data, arr, key) => {
  let checked = 'all';
  // определяем, что выбрано
  arr.forEach(item => checked = item.checked ? item.value.toLowerCase() : checked);

  if (checked !== 'all') {
    data = data.filter(item => item[key].toLowerCase() === checked);
  } 
  return data;        
};

document.addEventListener('DOMContentLoaded', function () {
  fetch('./dbHeroes.json')
    .then(function (value) {
      if (value.status !== 200) {
        // return Promise.reject(value);
        throw new Error('status network not 200');
      }
      return value.json();
    })
    .then(function (data) {
      movieList(data);
      render(data);
      filterForm.addEventListener('change', e => {
        let filterMovie = data;  
        const select = filterForm.querySelector('.movies');
        const gender = filterForm.querySelectorAll('[name=gender]');
        const status = filterForm.querySelectorAll('[name=status]');
     
        // фильтр по фильмам
        if (select.value !== 'all') {
          filterMovie = filterMovie.filter(item => item.movies && item.movies.includes(select.value));
        }       
        filterMovie = filter(filterMovie, gender, 'gender');
        filterMovie = filter(filterMovie, status, 'status');
        
        // выводим отфильтрованный массив на страницу
        if (filterMovie.length) {
          render(filterMovie);
        } else {
          output.innerHTML = '<h2 class="answer">По Вашему запросу ничего не найдено</h2>';
        }      

      });

    })
    .catch(function (reason) {
      output.innerHTML = 'Упс ,что-то пошло не так!';
      console.error('error:' + reason.status);
    });

  



});