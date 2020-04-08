import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

function Square(props: {
  value: string;
  highlight: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={"square" + (props.highlight ? " square-highlight" : "")}
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
}

class Board extends React.Component<{
  squares: string[];
  onClick: (i: number) => void;
}> {
  renderSquare(i: number) {
    const winnerRow = calculateWinner(this.props.squares);
    return (
      <Square
        value={this.props.squares[i]}
        highlight={!!winnerRow && winnerRow.includes(i)}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    return React.createElement(
      // create board element
      "div",
      null,
      new Array(3) // create row elements
        .fill("")
        .map((_, row) =>
          React.createElement(
            "div",
            { className: "board-row" },
            ...new Array(3) // create col elements
              .fill("")
              .map((_, col) => this.renderSquare(row * 3 + col))
          )
        )
    );
  }
}

function Toggle(props: { toggled: boolean; onClick: () => void }) {
  return (
    <button onClick={props.onClick}>
      {props.toggled ? "Ascending" : "Descending"}
    </button>
  );
}

type Move = {
  squares: string[];
  description: string;
};

type GampeState = {
  history: Move[];
  ascending: boolean;
  stepNumber: number;
  xIsNext: boolean;
};

class Game extends React.Component<{}, GampeState> {
  constructor(props: any) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
          description: "Go to game start.",
        },
      ],
      ascending: true,
      stepNumber: 0,
      xIsNext: true,
    };
  }

  handleClick(i: number) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const player = this.state.xIsNext ? "X" : "O";
    squares[i] = player;
    const description =
      "Go to move #" +
      history.length +
      ". " +
      player +
      " moves: col " +
      ((i % 3) + 1) +
      ", row " +
      Math.floor(i / 3 + 1);
    this.setState({
      history: history.concat([
        {
          squares,
          description,
        },
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(stepNumber: number) {
    this.setState({
      stepNumber,
      xIsNext: stepNumber % 2 === 0,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winnerRow = calculateWinner(current.squares);

    let moves = history.map((step, move) => {
      const moveDescription =
        move === this.state.stepNumber ? ( // highlight/make bold for current step
          <strong>{step.description}</strong>
        ) : (
          step.description
        );
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{moveDescription}</button>
        </li>
      );
    });
    if (!this.state.ascending) {
      moves = moves.reverse();
    }

    let status;
    if (winnerRow) {
      status = "Winner: " + current.squares[winnerRow[0]];
    } else if (this.state.stepNumber < 9) {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    } else {
      status = "Game ended with a draw!";
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <Toggle
            toggled={this.state.ascending}
            onClick={() => this.setState({ ascending: !this.state.ascending })}
          />
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateWinner(squares: string[]) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return lines[i];
    }
  }
  return null;
}
