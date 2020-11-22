import React from 'react'

const CANVAS_SIZE = [800, 800]
const STARTING_SNAKE_LENGTH = 4
const SNAKE_COLOR = "green"
const FOOD_COLOR = "red"
const SCALE = 40
const STARTING_INTERVAL = 500;
const DIRECTIONS = {
    37: [-SCALE, 0], //left
    38: [0, -SCALE], //up
    39: [SCALE, 0], //right
    40: [0, SCALE] //down
}
const STATES = {
    NOT_STARTED: 0,
    IN_PROGRESS: 1,
    PAUSED: 2,
    WON: 3,
    LOST: 4
}

class Snake extends React.Component {
    constructor(props) {
        super(props)
        //Create ref for canvas
        this.canvasRef = React.createRef();
        //Bind methods
        this.handleKeyPress = this.handleKeyPress.bind(this)
        //Create state
        this.snake_position = []
        this.food_position = []
        this.state = {
            last_game_state: null,
            game_state: STATES.NOT_STARTED,
            score: 0,
            direction: DIRECTIONS[39],
            interval: STARTING_INTERVAL
        }
    }

    componentDidMount() {
        this.setState({game_state: STATES.NOT_STARTED})
    }

    componentWillUnmount() {
        this.setState({game_state: STATES.NOT_STARTED})
    }

    componentDidUpdate() {
        //If the state of the game changed
        if(this.state.last_game_state != this.state.game_state) {
            switch(this.state.game_state) {
                case STATES.NOT_STARTED:
                    this.resetGame()
                    break
                case STATES.IN_PROGRESS:
                    this.continueGame()
                    break
                case STATES.PAUSED:
                    this.pauseGame()
                    break
                case STATES.WON:
                    this.wonGame()
                    break
                case STATES.LOST:
                    this.lostGame()
                    break
                default:
                    console.error("Incorrect value passed into game state")
                    break
            }
            this.state.last_game_state = this.state.game_state
        }
    }

    //Change the direction of the snake
    handleKeyPress(event) {
        event.preventDefault()
        let new_direction = DIRECTIONS[event.keyCode]
        //If the key pressed was valid
        if(typeof new_direction !== "undefined") {
            //Prevents going left when currently going right,
            //up when currently going down, etc
            let x_check = this.state.direction[0] * new_direction[0]
            let y_check = this.state.direction[1] * new_direction[1]
            if(x_check == 0 && y_check == 0) {
                this.setState({direction: new_direction})
            }
        }
        //Start game if needed
        if(this.state.game_state != STATES.IN_PROGRESS) {
            this.setState({game_state: STATES.IN_PROGRESS})
        }
    }

    resetGame() {
        console.log("RESETTI SPAGHETTI")
        clearInterval(this.intervalId)
        //Create new positions for the snake
        let snake = []
        let snake_head = [this.randomPos(), this.randomPos()]
        snake.push(snake_head)
        //Create the rest of the snake, as a line going to the left
        //Modulus is used so the snake can go through walls
        for (let i = 1; i < STARTING_SNAKE_LENGTH; i++) {
            //Shift
            let new_pos = snake_head[0]-(i*SCALE)
            //Mod
            new_pos = (new_pos + CANVAS_SIZE[0]) % CANVAS_SIZE[0]
            snake.push([new_pos, snake_head[1]])
        }
        this.snake_position = snake
        this.food_position = []
        this.setState({score: 0})
        this.spawnFood()
        this.draw()
    }

    spawnFood() {
        //Create new positions for the food
        let food_pos = [0, 0]
        let attempt = 0
        do {
            food_pos = [this.randomPos(), this.randomPos()]
        } while(this.snake_position.some((pos) => JSON.stringify(pos) === JSON.stringify(food_pos)) && attempt < 100)
        let temp_food = this.food_position
        temp_food.push(food_pos)
        this.food_position = temp_food
    }

    continueGame() {
        this.draw()
        this.intervalId = setInterval(this.tick.bind(this), STARTING_INTERVAL)
    }

    pauseGame() {
        clearInterval(this.intervalId)
    }

    wonGame() {
        clearInterval(this.intervalId)
        //TODO show score
    }

    lostGame() {
        clearInterval(this.intervalId)
        //TODO show message
    }

    //Returns a random position on the canvas
    randomPos() {
        //Create random number in canvas
        let x = Math.floor(Math.random() * Math.floor(800))
        //Round down to nearest block
        return SCALE*(Math.floor(x/SCALE))
    }

    //Calculate and draw the next step of the game
    tick() {
        console.log("TICK")
        let temp_snake = this.snake_position
        //Snake moves in direction of last key press
        let new_snake_head = [temp_snake[0][0] + this.state.direction[0], temp_snake[0][1] + this.state.direction[1]]
        //Allows snake to go through walls
        new_snake_head = [(new_snake_head[0] + CANVAS_SIZE[0]) % CANVAS_SIZE[0], (new_snake_head[1] + CANVAS_SIZE[1])  % CANVAS_SIZE[1]]
        //If the snake ran into itself
        if (temp_snake.some((pos) => JSON.stringify(pos) === JSON.stringify(new_snake_head))) {
            this.setState({game_state: STATES.LOST})
            return
        }
        //Add the next position of the snake to the front of the snake array
        temp_snake.unshift(new_snake_head)
        //If the snake ate any food
        let temp_food = this.food_position
        let ate_food = false
        for(let i = 0; i < temp_food.length; i++) {
            if(JSON.stringify(temp_food[i]) === JSON.stringify(new_snake_head)) {
                ate_food = true
                temp_food.splice(i, 1);
                this.food_position = temp_food
                this.setState({score: this.state.score + 1})
                this.spawnFood()
            }
        }
        if(!ate_food) {
            //Keep the snake the same length
            temp_snake.pop()
        }
        this.snake_position = temp_snake
        this.draw()
    }

    draw() {
        console.log("earlier in draw")
        //Find the canvas context
        if(this.canvasRef == null || this.canvasRef.current == null) {
            console.error("Tried to draw snake game, but canvas could not be found")
            return
        }
        let context = this.canvasRef.current.getContext("2d")
        //Clear the canvas
        context.clearRect(0, 0, CANVAS_SIZE[0], CANVAS_SIZE[1])
        //Draw the snake
        context.fillStyle = SNAKE_COLOR
        this.snake_position.forEach(([x, y]) => context.fillRect(x, y, SCALE, SCALE))
        //Draw the food
        context.fillStyle = FOOD_COLOR
        this.food_position.forEach(([x, y]) => context.fillRect(x, y, SCALE, SCALE))
    }


    render() {
        return(
            <div>
                <h1>{this.state.score}</h1>
                <canvas onKeyDown={e => this.handleKeyPress(e)}
                    tabIndex="0"
                    ref={this.canvasRef}
                    style={{border: "1 px solid red"}}
                    width="800px"
                    height="800px"
                />
            </div>
        )
    }
}

export default Snake