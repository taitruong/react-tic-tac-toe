import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

function Square(props) {
  return (
    <button className={'square' + (props.highlight ? ' square-highlight' : '')} onClick={() => props.onClick()}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    const winnerRow = calculateWinner(this.props.squares);
    return (
      <Square
        value={this.props.squares[i]}
        highlight={winnerRow && winnerRow.includes(i)}
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

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
          move: null,
        },
      ],
      ascending: true,
      stepNumber: 0,
      xIsNext: true,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const player = this.state.xIsNext ? "X" : "O";
    squares[i] = player;
    const move =
      player +
      " moves: col " +
      (parseInt(i / 3) + 1) +
      ", row " +
      ((i % 3) + 1);
    this.setState({
      history: history.concat([
        {
          squares,
          move,
        },
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(stepNumber) {
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
      let desc = move ? "Go to move #" + move : "Go to game start.";
      desc += step.move ? ". " + step.move : "";
      if (move === this.state.stepNumber) {
        desc = <strong>{desc}</strong>;
      }
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
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
      status = "Game ended with a draw!"
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
          <button
            onClick={() => this.setState({ ascending: !this.state.ascending })}
          >
            {this.state.ascending ? "ascending" : "descending"}
          </button>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateWinner(squares) {
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
