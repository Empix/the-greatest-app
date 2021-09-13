(function () {
  'use strict';

  // HAMBURGUER MENU
  const $hamburguer = document.querySelector('[data-js="menu-hamburguer"]');
  const $menu = document.querySelector('[data-js="menu"]');

  $hamburguer.addEventListener('click', () => {
    if (!$menu.dataset.opened) {
      $menu.style.display = 'flex';
      $menu.dataset.opened = true;
    } else {
      $menu.style.display = 'none';
      delete $menu.dataset.opened;
    }
  });

  window.addEventListener('resize', () => {
    // $menu.style.display = '';
    $menu.removeAttribute('style');
    delete $menu.dataset.opened;
  });

  // APP
  const app = {
    init() {
      this.initProps();
      this.initEvents();
      this.getData();
    },

    initProps() {
      this.data;
      this.currentGame;
      this.cartTotal = 0;

      this.$description = document.querySelector('[data-js="description"]');
      this.$numbers = document.querySelector('[data-js="numbers"]');
      this.$cart = document.querySelector('[data-js="cart"]');
      this.$cartTotal = document.querySelector('[data-js="total-price"]');
    },

    initEvents() {
      const $completeGame = document.querySelector('[data-js="complete-game"]');
      const $clearGame = document.querySelector('[data-js="clear-game"]');
      const $addToCart = document.querySelector('[data-js="add-to-cart"]');

      $completeGame.addEventListener('click', this.randomCompleteGame);
      $clearGame.addEventListener('click', this.clearSelectedNumbers);
      $addToCart.addEventListener('click', this.handleAddToCart);
    },

    getData() {
      const ajax = new XMLHttpRequest();
      ajax.open('GET', './games.json');
      ajax.send();

      ajax.addEventListener('readystatechange', () => {
        if (ajax.status === 200 && ajax.readyState === 4) {
          this.data = JSON.parse(ajax.responseText);
          this.populateData();
        }
      });
    },

    populateData() {
      const data = this.data;
      console.log(data);
      this.currentGame = 0;

      const $games = document.querySelector('[data-js="games"]');

      data.types.forEach((game, index) => {
        const button = document.createElement('button');
        button.textContent = game.type;
        button.dataset.index = index;
        button.style.color = game.color;
        button.style.borderColor = game.color;

        button.addEventListener('click', this.handleGameSelect);

        data.types[index].button = button;
        $games.appendChild(button);
      });

      const game = data.types[this.currentGame];
      this.toggleActiveButton(game, null);
      this.changeDescription(game.description);
      this.changeNumbers(game.range);
    },

    handleGameSelect() {
      app.clearSelectedNumbers();

      const button = this;

      if (app.currentGame === button.dataset.index) return;

      const oldGame = app.data.types[app.currentGame];
      app.currentGame = button.dataset.index;
      const newGame = app.data.types[app.currentGame];

      app.toggleActiveButton(newGame, oldGame);
      app.changeDescription(newGame.description);
      app.changeNumbers(newGame.range);
    },

    handleAddToCart() {
      const selectedNumbers = app.getSelectedNumbers();
      const currentGameInfo = app.data.types[app.currentGame];

      if (selectedNumbers.length < currentGameInfo['max-number']) return;

      const template = document.querySelector('[data-js="cart-item-template"]');
      const item = template.content.cloneNode(true);

      const $bet = item.querySelector('.bet');
      const $numbers = item.querySelector('.bet-numbers');
      const $name = item.querySelector('.bet-name');
      const $price = item.querySelector('.bet-price');
      const $remove = item.querySelector('.remove');

      $bet.style.borderColor = currentGameInfo.color;
      $name.style.color = currentGameInfo.color;
      $name.textContent = currentGameInfo.type;
      $numbers.textContent = selectedNumbers.join(', ');
      $price.textContent = app.formatPrice(currentGameInfo.price);

      $remove.dataset.price = currentGameInfo.price;
      $remove.addEventListener('click', app.handleRemoveItemFromCart);

      app.cartTotal += currentGameInfo.price;
      app.updateCartTotal();

      app.$cart.appendChild(item);
    },

    handleRemoveItemFromCart() {
      const item = this.parentElement;
      const price = parseFloat(this.dataset.price);

      item.remove();

      app.cartTotal -= price;
      app.updateCartTotal();
    },

    updateCartTotal() {
      app.$cartTotal.textContent = app.formatPrice(app.cartTotal);
    },

    formatPrice(value) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(value);
    },

    changeNumbers(range) {
      const currentRange = this.$numbers.childElementCount;
      const difference = range - currentRange;

      if (difference < 0) {
        for (let i = 0; i > difference; i--) {
          this.$numbers.lastElementChild.remove();
        }
      } else {
        for (let i = 0; i < difference; i++) {
          const number = document.createElement('div');
          number.classList.add('number');
          number.textContent = currentRange + i + 1;

          number.addEventListener('click', this.handleNumberClick);

          this.$numbers.appendChild(number);
        }
      }
    },

    handleNumberClick() {
      const currentGameInfo = app.data.types[app.currentGame];

      const selectedNumbersCount = app.getSelectedNumbers().length;

      if (this.dataset.selected) {
        delete this.dataset.selected;
        this.style.backgroundColor = '#adc0c4';
      } else if (selectedNumbersCount < currentGameInfo['max-number']) {
        this.dataset.selected = true;
        this.style.backgroundColor = currentGameInfo.color;
      }
    },

    clearSelectedNumbers() {
      document.querySelectorAll('[data-selected="true"]').forEach((element) => {
        delete element.dataset.selected;
        element.style.backgroundColor = '#adc0c4';
      });
    },

    randomCompleteGame() {
      app.clearSelectedNumbers();

      const numbers = document.querySelectorAll('.number');
      const randomNumbers = [];
      const currentGameInfo = app.data.types[app.currentGame];

      for (let i = 0; i < currentGameInfo['max-number']; i++) {
        const randomNumber = Math.floor(Math.random() * numbers.length);

        if (!randomNumbers.includes(randomNumber)) {
          randomNumbers.push(randomNumber);
        } else {
          i--;
        }
      }

      randomNumbers.forEach((number) => {
        numbers[number].dataset.selected = true;
        numbers[number].style.backgroundColor = currentGameInfo.color;
      });
    },

    getSelectedNumbers() {
      const selectedNumbers = document.querySelectorAll(
        '[data-selected="true"]'
      );
      return Array.prototype.map.call(selectedNumbers, (element) => {
        return element.textContent;
      });
    },

    changeDescription(description) {
      this.$description.textContent = description;
    },

    toggleActiveButton(actived, old) {
      const newGameButton = actived.button;
      newGameButton.style.color = '#fff';
      newGameButton.style.backgroundColor = actived.color;

      if (old) {
        const oldGameButton = old.button;
        oldGameButton.style.color = old.color;
        oldGameButton.style.backgroundColor = '#fff';
      }
    },
  };

  app.init();
})();
