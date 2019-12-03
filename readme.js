var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var width = canvas.width; //ширина указанная в аргументах канваса в html
var height = canvas.height; // высота указанная в аргументах канваса в html

var blockSize = 10; // размер каждой ячейки из которых состоит игровое поле
var widthInBlocks = width / blockSize; // ширина игрового поля в ячейках (400/10 = 40ячеек)
var heightInBlocks = height / blockSize; // высота игрового поля в ячейках (400/10 = 40ячеек)

var score = 0; // очки в игре

var drawBorder = function () { // создаем рамку для игрового поля
  ctx.fillStyle = "Gray"; // у рамки будет серая заливка
  ctx.fillRect(0, 0, width, blockSize); // рисуем верхнюю часть рамки — прямоугольник в позиции(0, 0), то есть в верхнем левом углу «холста», шириной width(400 пикселей) 
  //и высотой blockSize (10 пикселей).
  ctx.fillRect(0, height - blockSize, width, blockSize); // нижняя рамка height - blockSize точка на 10 пикселей выше нижней границы «холста» и прямо у его левой границы.
  ctx.fillRect(0, 0, blockSize, height); // левая  рамка
  ctx.fillRect(width - blockSize, 0, blockSize, height); // правая рамка
};

var drawScore = function () { // отобразим текущий счет игры
  ctx.font = "20px Courier"; // шрифт текста
  ctx.fillStyle = "Black"; // цвет текста
  ctx.textAlign = "left"; // выравнивание текста по горизонтали
  ctx.textBaseline = "top"; // выравнивание по вертикали, под опорной точкой
  ctx.fillText("Счет: " + score, blockSize, blockSize); // выводим надпись со счетом на экран, в точке с координатами 10px 10px
};

var gameOver = function () {
  clearInterval(intervalId);
  ctx.font = "60px Courier";
  ctx.fillStyle = "Black";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Конец игры", width / 2, height / 2); // выводим надпись по центру поля
};

var Block = function (col, row) { // конструктор,  Значения строки и столбца передаются в конструктор Block как
  //аргументы и сохраняются в свойствах col и row нового объекта. Наш объект-ячейка позволяет задать позицию в сетке, но, чтобы в 
  //данной позиции что - то появилось, это что - то нужно нарисовать на «холсте».
  this.col = col;
  this.row = row;
};

Block.prototype.drawSquare = function (color) { // добавили объекту метод drawSquare для рисования квадрата - части змеи
  var x = this.col * blockSize; // пределяем столбец, например 3 столбец, 3*10 = 30px 
  var y = this.row * blockSize;
  ctx.fillStyle = color; // зададим при вызове в параметрах функции
  ctx.fillRect(x, y, blockSize, blockSize); // рисуем квадрат в точке x y шириной и выотой 10px
};

Block.prototype.drawCircle = function (color) { // добавили объекту метод drawCircle для рисования круга - яблока
  var centerX = this.col * blockSize + blockSize / 2; // делим на 2 чтобы найти центр круга в середине ячейки
  var centerY = this.row * blockSize + blockSize / 2;
  ctx.fillStyle = color;
  circle(centerX, centerY, blockSize / 2, true); //  blockSize / 2 - радиус, true - заливка цветом включена
};

Block.prototype.equal = function (otherBlock) {
  return this.col === otherBlock.col && this.row === otherBlock.row;
};
// Метод equal весьма прост: если свойства col и row двух ячеек(this
// и otherBlock) совпадают(то есть this.col равняется otherBlock.
// col и this.row равняется otherBlock.row), значит ячейки находятся
// в одной позиции и метод вернет true.

var Snake = function () {
  this.segments = [
    new Block(7, 5),
    new Block(6, 5),
    new Block(5, 5)
  ];
  this.direction = "right";
  this.nextDirection = "right";
};
// Свойство direction в строке хранит текущее направление дви -
//   жения змейки.Также в строке наш конструктор добавляет объекту
// свойство nextDirection, где хранится направление, в котором змейка
// будет двигаться на следующем шаге анимации.Это свойство будет изме -
//   няться в обработчике событий клавиатуры при нажатии на одну из кла -
//     виш - стрелок.Пока что
// конструктор присваивает обоим свойствам значение "right", чтобы
// в начале игры змейка двигалась вправо.

Snake.prototype.draw = function () {
  for (var i = 0; i < this.segments.length; i++) {
    this.segments[i].drawSquare("Blue");
  }
};

Snake.prototype.move = function () { //движение змеи в разные стороны
  var head = this.segments[0];
  var newHead;
  this.direction = this.nextDirection;
  if (this.direction === "right") {
    newHead = new Block(head.col + 1, head.row);
  } else if (this.direction === "down") {
    newHead = new Block(head.col, head.row + 1);
  } else if (this.direction === "left") {
    newHead = new Block(head.col - 1, head.row);
  } else if (this.direction === "up") {
    newHead = new Block(head.col, head.row - 1);
  }
  if (this.checkCollision(newHead)) {
    gameOver();
    return;
  }
  this.segments.unshift(newHead);
  if (newHead.equal(apple.position)) { // если голова совпала с яблоком по позиции
    score++;
    apple.move();
  } else {
    this.segments.pop();
  }
};


Snake.prototype.checkCollision = function (head) { //Проверка столкновений со стенами
  var leftCollision = (head.col === 0);
  var topCollision = (head.row === 0);
  var rightCollision = (head.col === widthInBlocks - 1);
  var bottomCollision = (head.row === heightInBlocks - 1);
  var wallCollision = leftCollision || topCollision || rightCollision || bottomCollision;
  var selfCollision = false;
  for (var i = 0; i < this.segments.length; i++) {
    if (head.equal(this.segments[i])) { // змейка столкнулась сама с собой
      selfCollision = true;
    }
  }
  return wallCollision || selfCollision; // будет true если змея столкнулась со стеной или с собой
};

// Управляем змейкой с клавиатуры
var directions = {
  37: "left",
  38: "up",
  39: "right",
  40: "down"
};
$("body").keydown(function (event) {
  var newDirection = directions[event.keyCode];
  if (newDirection !== undefined) { //елси мы нажали одну из клавиш  37: "left", 38: "up", 39: "right", 40: "down"
    snake.setDirection(newDirection); // меняем направление змейки
  }
});

Snake.prototype.setDirection = function (newDirection) { // делаем чтобы мы не могли резко поврнуть в противоположную  сторону
  if (this.direction === "up" && newDirection === "down") {
    return;
  } else if (this.direction === "right" && newDirection === "left") {
    return;
  } else if (this.direction === "down" && newDirection === "up") {
    return;
  } else if (this.direction === "left" && newDirection === "right") {
    return;
  }
  this.nextDirection = newDirection;
};
//Создаем яблоко
var Apple = function () {
  this.position = new Block(10, 10);
};

//Чтобы нарисовать яблоко, создадим метод draw:
Apple.prototype.draw = function () {
  this.position.drawCircle("LimeGreen");
};

//Перемещакм яблоко
//Метод move перемещает яблоко в случайную новую позицию на игро-
//вом поле(то есть в любую ячейку на «холсте», кроме области рамки).
//Мы будем вызывать этот метод всякий раз, когда змейка съест яблоко,
// чтобы оно появилось снова в другой позиции.
Apple.prototype.move = function () {
  var randomCol = Math.floor(Math.random() * (widthInBlocks - 2)) + 1;
  var randomRow = Math.floor(Math.random() * (heightInBlocks - 2)) + 1;
  this.position = new Block(randomCol, randomRow);
};
//В строке 1 и следующей строке мы создаем переменные randomCol
//и randomRow, которые примут значения, соответствующие случайному
//столбцу и случайной строке на игровом поле.


