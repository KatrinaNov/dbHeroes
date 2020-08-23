'use strict';

const output = document.querySelector('.output');
const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('.search');
const dropdownHero = document.querySelector('.dropdown-hero');
const moviesSelect = document.querySelector('#movies');
const filterForm = document.querySelector('.filter-form');
// вывод на страницу
const render = data => {
  let inner = '';
  // если ничего не найдено
  if (data.length === 0) {
    inner = '<h2 class="answer">По Вашему запросу ничего не найдено</h2>';
  }
  const transformValue = value => (value ? value : 'неизвестно');
  data.forEach(item => {
    // проверка пути у фото, если его нету или путь не верный, то ставим заглушку
    const regPhoto = /^dbimage\/.+\.(jpg|png|jpeg)$/;
    const poster = (item.photo && regPhoto.test(item.photo)) ? item.photo : './img/noposter.jpg';
    // выводим дату смерти только если стоит статус Deceased и есть дата смерти
    const dateDeath = () => ((item.status.toLowerCase() === 'deceased' && item.deathDay) ? `
    <div class="card-text">Дата смерти: ${item.deathDay}</div>` : '');

    inner += `
      <div class="card">
        <div class="card-front">
          <img class="card-img" src='${poster}'>
          <div class="card-name">${item.name}</div>
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
  const movieList = new Set();
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
// фильтр по выбранной радиокнопке, возвращает отфильтрованный массив
const filter = (data, arr, key) => {
  let checked = 'all';
  // определяем, что выбрано
  arr.forEach(item => checked = item.checked ? item.value.toLowerCase() : checked);

  if (checked !== 'all') {
    data = data.filter(item => item[key].toLowerCase() === checked);
  }
  return data;
};
// всплывающий список с героями в поиске
const createListOfHero = (data, input, list) => {
  list.textContent = '';
  const nameHeroes = [];

  if (input.value !== '') {
    const filterHero = data.filter(item => {
      const fixItem = item.name.toLowerCase();
      return fixItem.startsWith(input.value.toLowerCase());
    });

    filterHero.forEach(item => {
      const li = document.createElement('li');
      li.classList.add('dropdown-hero__item');
      li.textContent = item.name;
      list.append(li);
      nameHeroes.push(item);
    });
    return nameHeroes;
  }
};
// выбор героя из списка
const selectHeroFromList = (event, input, list) => {
  const target = event.target;
  if (target.tagName.toLowerCase() === 'li') {
    input.value = target.textContent;
    list.textContent = '';
  }
};
// возвращаем данные фильтра к изначальному состоянию
const resetFilter = () => {
  filterForm.querySelectorAll('[value=all]').forEach(item => item.checked = true);
  filterForm.querySelector('.movies').value = 'all';
};

const eventHandler = data => {
  // ввод значений в инпут поиска
  searchInput.addEventListener('input', () => {
    resetFilter();

    if (!searchInput.value) {
      render(data);
      dropdownHero.textContent = '';
      return;
    }

    const listOfHero = createListOfHero(data, searchInput, dropdownHero);
    if (listOfHero.length) {
      render(listOfHero);
    } else {
      output.innerHTML = '<h2 class="answer">По Вашему запросу ничего не найдено</h2>';
    }

  });
  // клик по выпадающему списку поиска
  dropdownHero.addEventListener('click', event => {
    selectHeroFromList(event, searchInput, dropdownHero);
    render(data.filter(item => item.name === event.target.textContent));
  });
  // обработка отправки поля поиска
  searchForm.addEventListener('submit', event => {
    event.preventDefault();
    dropdownHero.textContent = '';
  });

  // фильтры
  filterForm.addEventListener('change', () => {
    searchInput.value = '';
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

};

document.addEventListener('DOMContentLoaded', () => {
  fetch('./dbHeroes.json')
    .then(value => {
      if (value.status !== 200) {
        throw new Error('status network not 200');
      }
      return value.json();
    })
    .then(data => {
      movieList(data); // создаем список фильмов
      render(data); // выводим всех героев на экран
      eventHandler(data); // обработчики событий
    })
    .catch(reason => {
      output.innerHTML = 'Упс ,что-то пошло не так!';
      console.error('error:' + reason.status);
    });

});
