class SnakeGame {
    constructor(canvasId = 'gameCanvas') {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Configuración del juego
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        this.gameSpeed = 10; // FPS
        this.frameCounter = 0;
        
        // Estado del juego
        this.gameRunning = false;
        this.gamePaused = false;
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        
        // Serpiente
        this.snake = [
            { x: 10, y: 10 }
        ];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        
        // Comida
        this.food = this.generateFood();
        
        // Event listeners
        this.setupEventListeners();
        this.updateHighScoreDisplay();
    }
    
    setupEventListeners() {
        // Controles de teclado
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Botones
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('restartBtn').addEventListener('click', () => this.restart());
    }
    
    handleKeyPress(e) {
        if (!this.gameRunning) return;
        
        switch(e.key.toLowerCase()) {
            case 'arrowup':
            case 'w':
                if (this.direction.y === 0) this.nextDirection = { x: 0, y: -1 };
                e.preventDefault();
                break;
            case 'arrowdown':
            case 's':
                if (this.direction.y === 0) this.nextDirection = { x: 0, y: 1 };
                e.preventDefault();
                break;
            case 'arrowleft':
            case 'a':
                if (this.direction.x === 0) this.nextDirection = { x: -1, y: 0 };
                e.preventDefault();
                break;
            case 'arrowright':
            case 'd':
                if (this.direction.x === 0) this.nextDirection = { x: 1, y: 0 };
                e.preventDefault();
                break;
            case ' ':
                this.togglePause();
                e.preventDefault();
                break;
            case 'r':
                this.restart();
                e.preventDefault();
                break;
        }
    }
    
    start() {
        if (this.gameRunning) return;
        
        this.gameRunning = true;
        this.gamePaused = false;
        document.getElementById('startBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        this.updateStatus('¡Juego iniciado! 🎮', 'info');
        
        this.gameLoop();
    }
    
    togglePause() {
        if (!this.gameRunning) return;
        
        this.gamePaused = !this.gamePaused;
        document.getElementById('pauseBtn').textContent = this.gamePaused ? 'Reanudar' : 'Pausar';
        this.updateStatus(this.gamePaused ? '⏸️ PAUSADO' : '▶️ Jugando...', 'info');
    }
    
    restart() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.score = 0;
        this.snake = [{ x: 10, y: 10 }];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.food = this.generateFood();
        this.frameCounter = 0;
        
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('pauseBtn').textContent = 'Pausar';
        
        this.updateScoreDisplay();
        this.updateStatus('', '');
        this.draw();
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        this.frameCounter++;
        
        if (this.frameCounter >= 60 / this.gameSpeed && !this.gamePaused) {
            this.frameCounter = 0;
            this.update();
        }
        
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        // Actualizar dirección
        this.direction = this.nextDirection;
        
        // Calcular nueva cabeza
        const head = this.snake[0];
        const newHead = {
            x: head.x + this.direction.x,
            y: head.y + this.direction.y
        };
        
        // Verificar colisión con paredes
        if (this.checkWallCollision(newHead)) {
            this.gameOver('¡Chocaste con la pared! 💥');
            return;
        }
        
        // Verificar colisión consigo misma
        if (this.checkSelfCollision(newHead)) {
            this.gameOver('¡Te comiste a ti misma! 😱');
            return;
        }
        
        // Añadir nueva cabeza
        this.snake.unshift(newHead);
        
        // Verificar si comió comida
        if (newHead.x === this.food.x && newHead.y === this.food.y) {
            this.score += 10;
            this.updateScoreDisplay();
            this.food = this.generateFood();
        } else {
            // Si no comió, eliminar cola
            this.snake.pop();
        }
    }
    
    generateFood() {
        let food;
        let isOnSnake;
        
        do {
            isOnSnake = false;
            food = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
            
            // Verificar que la comida no esté en la serpiente
            for (let segment of this.snake) {
                if (segment.x === food.x && segment.y === food.y) {
                    isOnSnake = true;
                    break;
                }
            }
        } while (isOnSnake);
        
        return food;
    }
    
    checkWallCollision(head) {
        return head.x < 0 || head.x >= this.tileCount || 
               head.y < 0 || head.y >= this.tileCount;
    }
    
    checkSelfCollision(head) {
        for (let segment of this.snake) {
            if (segment.x === head.x && segment.y === head.y) {
                return true;
            }
        }
        return false;
    }
    
    draw() {
        // Limpiar canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dibujar grid
        this.drawGrid();
        
        // Dibujar serpiente
        this.drawSnake();
        
        // Dibujar comida
        this.drawFood();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 0.5;
        
        for (let i = 0; i <= this.tileCount; i++) {
            const pos = i * this.gridSize;
            
            // Líneas verticales
            this.ctx.beginPath();
            this.ctx.moveTo(pos, 0);
            this.ctx.lineTo(pos, this.canvas.height);
            this.ctx.stroke();
            
            // Líneas horizontales
            this.ctx.beginPath();
            this.ctx.moveTo(0, pos);
            this.ctx.lineTo(this.canvas.width, pos);
            this.ctx.stroke();
        }
    }
    
    drawSnake() {
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            
            if (i === 0) {
                // Cabeza - Color más brillante
                this.ctx.fillStyle = '#00ff00';
            } else if (i === 1) {
                // Segundo segmento - Color un poco menos brillante
                this.ctx.fillStyle = '#00dd00';
            } else {
                // Cuerpo - Gradual
                this.ctx.fillStyle = '#00aa00';
            }
            
            this.ctx.fillRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2);
            
            // Borde
            this.ctx.strokeStyle = '#00ff00';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2);
        }
    }
    
    drawFood() {
        const x = this.food.x * this.gridSize;
        const y = this.food.y * this.gridSize;
        
        // Dibujar círculo de comida
        this.ctx.fillStyle = '#ff3333';
        this.ctx.beginPath();
        this.ctx.arc(x + this.gridSize / 2, y + this.gridSize / 2, this.gridSize / 2 - 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Brillo
        this.ctx.fillStyle = '#ffaa00';
        this.ctx.beginPath();
        this.ctx.arc(x + this.gridSize / 2 - 3, y + this.gridSize / 2 - 3, 3, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    gameOver(message) {
        this.gameRunning = false;
        
        // Actualizar high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            this.updateHighScoreDisplay();
            this.updateStatus(`${message} ¡NUEVO RÉCORD! 🏆 Puntuación: ${this.score}`, 'success');
        } else {
            this.updateStatus(`${message} Puntuación: ${this.score}`, '');
        }
        
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
    }
    
    updateScoreDisplay() {
        document.getElementById('score').textContent = this.score;
    }
    
    updateHighScoreDisplay() {
        document.getElementById('highScore').textContent = this.highScore;
    }
    
    updateStatus(message, className) {
        const statusEl = document.getElementById('status');
        statusEl.textContent = message;
        statusEl.className = 'status ' + className;
    }
}

// Iniciar el juego cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const game = new SnakeGame('gameCanvas');
});