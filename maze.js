(function () {
    'use strict';

    var Maze = window.Maze = function (settings) {

        this.container = settings.container;
        this.height = settings.height || 500;
        this.width = settings.width || 500;
        this.rows = settings.rows || 15;
        this.cols = settings.cols || 15;
        this.borderWidth = settings.borderWidth || 1;

        this._dom = null;
        this._ctx = null;
        this._ballCoord = { row: 0, col: 0 };
        this._lastBallCoord = { row: 0, col: 0 };
        this._map = [];

        this.init();
        this.draw();
    };

    Maze.prototype.init = function () {

        //correct width/height
        this.height = Math.ceil(this.height / this.rows) * this.rows;
        this.width = Math.ceil(this.width / this.cols) * this.cols;
    
        this._dom = document.createElement("canvas");
        this._ctx = this._dom.getContext("2d");
        this._dom.height = this.height + 1;
        this._dom.width = this.width + 1;
        this.container.appendChild(this._dom);
        document.addEventListener("keydown", this.move.bind(this));
        this.clear();
    };
    
    Maze.prototype.clear = function () {
        
        this._map = [];
        for (var i = 0; i < this.rows; i++) {
            var row = [];
            for (var j = 0; j < this.cols; j++) {
                row.push({
                    row: i,
                    col: j,
                    empty: true,
                    directions: { }
                });
            }
            this._map.push(row);
        }
        this._ballCoord = { row: 0, col: 0 };
        this._lastBallCoord = { row: 0, col: 0 };

        this._ctx.fillStyle = "#2683A1";
        this._ctx.fillRect(0, 0, this.width, this.height);
        this._ctx.fillStyle = "red";
        this._ctx.fillRect(
            this.width - Math.ceil(this.width / this.cols),
            this.height - Math.ceil(this.height / this.rows),
            Math.ceil(this.width / this.cols),
            Math.ceil(this.height / this.rows)
        );
    };

    Maze.prototype.draw = function () {

        var rowStep = Math.ceil(this.height / this.rows),
            colStep = Math.ceil(this.width / this.cols),
            width = rowStep - 2,
            height = colStep - 2,
            eps = this.borderWidth / 2 + 0.5;

        function recursiveDraw(row, col) {

            var map = this._map,
                item = map[row][col],
                variants = [];

            item.empty = false;

            if (map[row - 1] && map[row - 1][col] && map[row - 1][col].empty) {
                variants.push(map[row - 1][col]);
            }
            if (map[row + 1] && map[row + 1][col] && map[row + 1][col].empty) {
                variants.push(map[row + 1][col]);
            }
            if (map[row][col - 1] && map[row][col - 1].empty) {
                variants.push(map[row][col - 1]);
            }
            if (map[row][col + 1] && map[row][col + 1].empty) {
                variants.push(map[row][col + 1]);
            }

            if (variants.length) {
                while (variants.length) {
                    var randomIndex = Math.floor(Math.random() * variants.length),
                        variant = variants.splice(randomIndex, 1)[0];

                    if (variant.empty) {
                        this._ctx.beginPath();
                        if (variant.row > row) {
                            item.directions.bottom = true;
                            variant.directions.top = true;
                            this._ctx.moveTo(col * colStep + eps, (row + 1) * rowStep + 0.5);
                            this._ctx.lineTo((col + 1) * colStep - eps, (row + 1) * rowStep + 0.5);
                        } else if (variant.row < row) {
                            item.directions.top = true;
                            variant.directions.bottom = true;
                            this._ctx.moveTo(col * colStep + eps, row * rowStep + 0.5);
                            this._ctx.lineTo((col + 1) * colStep - eps, row * rowStep + 0.5);
                        } else if (variant.col > col) {
                            item.directions.right = true;
                            variant.directions.left = true;
                            this._ctx.moveTo((col + 1) * colStep + 0.5, row * rowStep + eps);
                            this._ctx.lineTo((col + 1) * colStep + 0.5, (row + 1) * rowStep - eps);
                        } else {
                            item.directions.left = true;
                            variant.directions.right = true;
                            this._ctx.moveTo(col * colStep + 0.5, row * rowStep + eps);
                            this._ctx.lineTo(col * colStep + 0.5, (row + 1) * rowStep - eps);
                        }
                        this._ctx.closePath();
                        this._ctx.stroke();
                        recursiveDraw.call(this, variant.row, variant.col);
                    }
                }
            }
        };

        this._ctx.strokeStyle = "#FFF";
        this._ctx.lineWidth = this.borderWidth * 2;
        recursiveDraw.call(this, 0, 0);
        
        this.drawBall();
    };

    Maze.prototype.drawBall = function () {

        var rowStep = Math.ceil(this.height / this.rows),
            colStep = Math.ceil(this.width / this.cols),
            lastX = this._lastBallCoord.col,
            lastY = this._lastBallCoord.row,
            r = Math.min(rowStep, colStep) / 4,
            x = this._ballCoord.col,
            y = this._ballCoord.row;

        this._ctx.fillStyle = "#fff";
        this._ctx.beginPath();
        this._ctx.arc((lastX + 0.5) * colStep + 0.5, (lastY + 0.5) * rowStep + 0.5, r + 1, 0, Math.PI * 2);
        this._ctx.closePath();
        this._ctx.fill();

        this._ctx.fillStyle = "red";
        this._ctx.beginPath();
        this._ctx.arc((x + 0.5) * colStep + 0.5, (y + 0.5) * rowStep + 0.5, r, 0, Math.PI * 2);
        this._ctx.closePath();
        this._ctx.fill();

        this._lastBallCoord = { row: y, col: x };
    };

    Maze.prototype.move = function (event) {

        var mapItem = this._map[this._ballCoord.row][this._ballCoord.col];
        switch (event.keyCode)
        {
            case 37:
                if (mapItem.directions.left) {
                    this._ballCoord.col = Math.max(0, this._ballCoord.col - 1);
                    this.drawBall();
                }
                break;
            case 38:
                if (mapItem.directions.top) {
                    this._ballCoord.row = Math.max(0, this._ballCoord.row - 1);
                    this.drawBall();
                }
                break;
            case 39:
                if (mapItem.directions.right) {
                    this._ballCoord.col = Math.min(this.cols - 1, this._ballCoord.col + 1);
                    this.drawBall();
                }
                break;
            case 40:
                if (mapItem.directions.bottom) {
                    this._ballCoord.row = Math.min(this.rows - 1, this._ballCoord.row + 1);
                    this.drawBall();
                }
                break;
        }
        
        if (this._ballCoord.row === this.rows - 1 && this._ballCoord.col === this.cols - 1) {
            this._ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
            this._ctx.fillRect(15, 15, this.width - 30, this.height - 30);
            this._ctx.font = "25px monospace";
            this._ctx.fillStyle = "red";
            this._ctx.fillText("Sorry,", 40, this.height - 120);
            this._ctx.fillText("your princess", 40, this.height - 80);
            this._ctx.fillText("is in another castle", 40, this.height - 40);
            setTimeout(function() {
                this.clear();
                this.draw()
            }.bind(this), 3000);
        }
    };

})();