document.addEventListener("DOMContentLoaded", () => {
    let htmlElements = "";
    let takenHtml = "";
    let minigrid = "";
    for (var i = 0; i < 200; i++) {
       htmlElements += '<div></div>';
    };
    for (var i = 0; i < 10; i++) {
        takenHtml += "<div class='taken'></div>";
    };
    for (var i = 0; i < 16; i++) {
        minigrid += "<div></div>";
    };
    var container = document.getElementById("grid");
    var minicontainer = document.getElementById("mini-grid");
    htmlElements += takenHtml;
    container.innerHTML = htmlElements;
    minicontainer.innerHTML = minigrid;

    
    let squares = Array.from(document.querySelectorAll("#grid div"))
    const grid = document.querySelector("#grid");
    const scoreDisplay = document.querySelector("#score");
    const startBtn = document.querySelector("#start-button");
    const addSpeed = document.querySelector("#speed-add");
    const lowerSpeed = document.querySelector("#speed-lower");
    const speed = document.querySelector("#speed");
    const audio = new Audio("music.mp3");
    const displaySquares = document.querySelectorAll("#mini-grid div");
    const displayWidth = 4;
    const displayIndex = 0;
    const width = 10;
    let interval = 1000;
    let speedCount = 3;
    let nextRandom = 0;
    let timerId;
    let score = 0;
    let currentPosition = 4;
    let currentRotation = 0;
    let isgameOver = false;

    audio.loop = true;
        
    const colors = [
        "orange",
        "red",
        "purple",
        "green",
        "blue"
    ]

    const lTetromino = [
        [1, width + 1, width * 2 + 1, 2],
        [width, width + 1, width + 2, width * 2 + 2],
        [1, width + 1, width * 2 + 1, width * 2],
        [width, width * 2, width * 2 + 1, width * 2 + 2]
    ]

    const zTetromino = [
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1],
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1]
    ]

    const tTetromino = [
        [1, width, width + 1, width + 2],
        [1, width + 1, width + 2, width * 2 + 1],
        [width, width + 1, width + 2, width * 2 + 1],
        [1, width, width + 1, width * 2 + 1]
    ]

    const oTetromino = [
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1]
    ]

    const iTetromino = [
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3],
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3]
    ]

    const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino];
    let random = Math.floor(Math.random() * theTetrominoes.length);
    let current = theTetrominoes[random][currentRotation];

    const upNextTetrominoes = [
        [1, displayWidth + 1, displayWidth * 2 + 1, 2],
        [0, displayWidth, displayWidth + 1, displayWidth * 2 + 1],
        [1, displayWidth, displayWidth + 1, displayWidth + 2],
        [0, 1, displayWidth, displayWidth + 1],
        [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1]
    ]

    function draw() {
        if (!isgameOver) {
            current.forEach(index => {
            squares[currentPosition + index].classList.add("tetromino");
            squares[currentPosition + index].style.backgroundColor = colors[random];
        });
        }
    };

    function undraw() {
        if (!isgameOver) {
            current.forEach(index => {
            squares[currentPosition + index].classList.remove("tetromino");
            squares[currentPosition + index].style.backgroundColor = "";
        });
        }
    };

    function control(e) {
        if (!isgameOver) {
            if (e.keyCode === 37) {
                moveLeft();
            }
            else if (e.keyCode === 38) {
                rotate()
            }
            else if (e.keyCode === 39) {
                moveRight()
            }
            else if (e.keyCode === 40) {
                moveDown()
            };
        };

    };

    document.addEventListener("keyup", control);

    function moveDown() {
        undraw();
        currentPosition += width;
        draw();
        freeze();
    }

    function freeze() {
        if (current.some(index => squares[currentPosition + index + width].classList.contains("taken"))) {
            console.log(current.some(index => squares[currentPosition + index + width]))
            current.forEach(index => squares[currentPosition + index].classList.add("taken"));
            random = nextRandom;
            nextRandom = Math.floor(Math.random() * theTetrominoes.length);
            current = theTetrominoes[random][currentRotation];
            currentPosition = 4;
            draw();
            displayShape();
            addScore();
            gameOver();
        };
    };

    function moveLeft() {
        undraw();
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);

        if (!isAtLeftEdge) currentPosition -= 1;

        if (current.some(index => squares[currentPosition + index].classList.contains("taken"))) {
            currentPosition += 1;
        };
        draw()
    };

    function moveRight() {
        undraw();
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1);

        if (!isAtRightEdge) currentPosition += 1;

        if (current.some(index => squares[currentPosition + index].classList.contains("taken"))) {
            currentPosition -= 1;
        };
        draw()
    };

    function isAtRight() {
        return current.some(index => (currentPosition + index + 1) % width === 0)
    }

    function isAtLeft() {
        return current.some(index => (currentPosition + index) % width === 0)
    }

    function checkRotatedPosition(P) {
        P = P || currentPosition;

        if ((P + 1) % width < 4) {
            if (isAtRight()) {
                currentPosition += 1
                checkRotatedPosition(P)
            }
        }
        else if (P % width > 5) {
            if (isAtLeft()) {
                currentPosition -= 1
                checkRotatedPosition(P)
                }
            }
    }

    function rotate() {
        undraw();
        currentRotation++;

        if (currentRotation === current.length) {
            currentRotation = 0;
        };
        current = theTetrominoes[random][currentRotation];
        checkRotatedPosition();
        draw();
    };

    function displayShape() {
        displaySquares.forEach(square => {
            square.classList.remove("tetromino");
            square.style.backgroundColor = "";
        });
        upNextTetrominoes[nextRandom].forEach(index => {
            displaySquares[displayIndex + index].classList.add("tetromino");
            displaySquares[displayIndex + index].style.backgroundColor = colors[nextRandom];
        });
    }

    startBtn.addEventListener("click", () => {
        if (isgameOver) {
            document.location.reload();
        };
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
            audio.pause();
        }
        else {
            draw();
            timerId = setInterval(moveDown, 1000);
            displayShape();
            audio.play();
        }
    })

    speed.innerHTML = speedCount;
    addSpeed.addEventListener("click", () => {
        if (interval > 300) {
            if (timerId) {
                clearInterval(timerId);
                interval -= 350;
                timerId = setInterval(moveDown, interval);
                speedCount += 1;
                speed.innerHTML = speedCount;
            }
            else {
                interval -= 350;
                speedCount += 1;
                speed.innerHTML = speedCount;
            }
        }
        
    })

    lowerSpeed.addEventListener("click", () => {
        if (interval < 1700) {
            if (timerId) {
                clearInterval(timerId);
                interval += 350;
                timerId = setInterval(moveDown, interval);
                speedCount -= 1;
                speed.innerHTML = speedCount;
            }
            else{
                interval += 350;
                speedCount -= 1;
                speed.innerHTML = speedCount;
            }
        }
    })

    function addScore() {
        for (let i = 0; i < 199; i += width) {
            const row = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9]

            if (row.every(index => squares[index].classList.contains("taken"))) {
                score += 10;
                scoreDisplay.innerHTML = score;
                row.forEach(index => {
                    squares[index].classList.remove("taken");
                    squares[index].classList.remove("tetromino");
                    squares[index].style.backgroundColor = ""
                });
                const squaresRemoved = squares.splice(i, width);
                squares = squaresRemoved.concat(squares);
                squares.forEach(cell => grid.appendChild(cell))
            };
        };
    };

    function gameOver() {
        if (current.some(index => squares[currentPosition + index].classList.contains("taken"))) {
            scoreDisplay.innerHTML = "Game over";
            clearInterval(timerId);
            audio.currentTime = 0;
            isgameOver = true;
        }
    }

})

