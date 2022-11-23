import React from 'react';
import './App.css';

class BoxRow {
    selectedIndex?: number;
    emptyBoxIndex?: number;
    prizeIndex: number;

    constructor(prizeIndex: number) {
        this.prizeIndex = prizeIndex;
    }
}

enum Answer {
    KEEP_THE_SAME,
    CHANGE_TO_THE_OTHER_BOX,
    DOESNT_MATTER
}

function App() {
    const ROWS = 15;

    let initialBoxState = [];

    for (let i = 0; i < ROWS; i++) {
        initialBoxState.push(new BoxRow(Math.floor(Math.random() * 3)));
    }

    const [boxState, setBoxState] = React.useState(initialBoxState);
    const [answer, setAnswer] = React.useState<Answer | undefined>(undefined);

    let boxesInAllRowsSelected = true;
    let allEmptyBoxesOpened = true;

    const selectBox = (boxRow: number, selectedIndex: number) => {
        if (boxState[boxRow].emptyBoxIndex === undefined) {
            const newBoxState = [...boxState];
            newBoxState[boxRow].selectedIndex = newBoxState[boxRow].selectedIndex === selectedIndex ? undefined : selectedIndex;
            setBoxState(newBoxState);
        }
    }

    boxState.forEach(value => {
        boxesInAllRowsSelected = boxesInAllRowsSelected && value.selectedIndex != null;
        allEmptyBoxesOpened = allEmptyBoxesOpened && value.emptyBoxIndex != null;
    });

    let renderedBoxes = [];

    let won = 0;
    let lost = 0;

    for (let rowIndex = 0; rowIndex < boxState.length; rowIndex++) {
        let row: any = [];

        for (let boxIndex = 0; boxIndex < 3; boxIndex++) {
            let resultClass = "";
            let boxText = "";

            if (answer === undefined) {
                if (boxState[rowIndex].selectedIndex === boxIndex) {
                    resultClass = "selected";
                }
            } else {
                if (boxState[rowIndex].prizeIndex !== boxIndex) {
                    boxText = "💩";
                }

                if (boxState[rowIndex].selectedIndex === boxIndex) {
                    if (boxState[rowIndex].prizeIndex === boxState[rowIndex].selectedIndex) {
                        resultClass = "win";
                        won++;
                    } else {
                        resultClass = "lose";
                        lost++
                    }
                }

                if (boxState[rowIndex].prizeIndex === boxIndex) {
                    boxText = "💵";
                }
            }

            row.push(<div key={"door" + boxIndex}
                          className={"door " + resultClass + (boxIndex === boxState[rowIndex].emptyBoxIndex ? " disabled" : "")}
                          onClick={() => selectBox(rowIndex, boxIndex)}>{boxText}</div>);
        }
        renderedBoxes.push(<div key={"doors-row" + rowIndex} className={"doors-row"}><span
            className={"doors-row-name"}>Row {rowIndex + 1}:</span> {row} <span></span></div>);
    }

    const selectAnswer = function (newAnswer: Answer) {
        if (answer === undefined) {
            setAnswer(newAnswer);

            if (newAnswer === Answer.CHANGE_TO_THE_OTHER_BOX) {
                let newBoxState = [...boxState];
                for (let rowIndex = 0; rowIndex < newBoxState.length; rowIndex++) {
                    switch (newBoxState[rowIndex].selectedIndex) {
                        case 0:
                            if (newBoxState[rowIndex].emptyBoxIndex === 1) {
                                newBoxState[rowIndex].selectedIndex = 2;
                            } else if (newBoxState[rowIndex].emptyBoxIndex === 2) {
                                newBoxState[rowIndex].selectedIndex = 1;
                            }
                            break;
                        case 1:
                            if (newBoxState[rowIndex].emptyBoxIndex === 0) {
                                newBoxState[rowIndex].selectedIndex = 2;
                            } else if (newBoxState[rowIndex].emptyBoxIndex === 2) {
                                newBoxState[rowIndex].selectedIndex = 0;
                            }
                            break;
                        case 2:
                            if (newBoxState[rowIndex].emptyBoxIndex === 0) {
                                newBoxState[rowIndex].selectedIndex = 1;
                            } else if (newBoxState[rowIndex].emptyBoxIndex === 1) {
                                newBoxState[rowIndex].selectedIndex = 0;
                            }
                            break;
                    }
                }
                setBoxState(newBoxState);
            }

        }
    }

    const openOneEmptyBox = function () {
        let newBoxState = [...boxState];

        for (let rowIndex = 0; rowIndex < newBoxState.length; rowIndex++) {
            newBoxState[rowIndex].emptyBoxIndex = newBoxState[rowIndex].prizeIndex;

            while (newBoxState[rowIndex].emptyBoxIndex === newBoxState[rowIndex].selectedIndex || newBoxState[rowIndex].emptyBoxIndex === newBoxState[rowIndex].prizeIndex) {
                newBoxState[rowIndex].emptyBoxIndex = Math.floor(Math.random() * 3);
            }
        }

        setBoxState(newBoxState);
    }

    let step2 = boxesInAllRowsSelected ?
        <div className={"instructions"}>
            <div className={"instruction"}>So far your odds of winning are completely random.</div>
            <div className={"instruction bold underline"}>To make this challenge more interesting, we will hide one box
                without the prize in every row.
            </div>
            <div className={"question-option " + (allEmptyBoxesOpened ? "disabled" : "")}
                 onClick={() => openOneEmptyBox()}>Click to hide one empty box in every row
            </div>
        </div> : <></>;

    let step3 = allEmptyBoxesOpened ? <div className={"instructions"}>
        <div className={"instruction"}>
            You are now given a choice.
        </div>
        <div className={"instruction bold underline"}>
            Would you like to change your selected box to the other box (in every row)?
        </div>
        <div className={"instruction"}>
            Choose wisely!
        </div>
        <div className={"question-doors"}>
            <div className={"question-option " + (answer === Answer.KEEP_THE_SAME ? "disabled" : "")}
                 onClick={() => selectAnswer(Answer.KEEP_THE_SAME)}>Keep the same box in every row
            </div>
            <div className={"question-option " + (answer === Answer.CHANGE_TO_THE_OTHER_BOX ? "disabled" : "")}
                 onClick={() => selectAnswer(Answer.CHANGE_TO_THE_OTHER_BOX)}>Change
                to the
                other box in every row
            </div>
            <div className={"question-option " + (answer === Answer.DOESNT_MATTER ? "disabled" : "")}
                 onClick={() => selectAnswer(Answer.DOESNT_MATTER)}>It doesn't
                matter
            </div>
        </div>
    </div> : <></>;

    let result = undefined;

    if (answer !== undefined) {

        switch (answer) {
            case Answer.KEEP_THE_SAME:
                result = `💩 Poop, you should have changed to the other boxes! You could have won $${new Intl.NumberFormat('de-DE').format(lost * 100000)} if you changed boxes, but now you only won ${new Intl.NumberFormat('de-DE').format(won * 100000)}! 💩`;
                break;
            case Answer.CHANGE_TO_THE_OTHER_BOX:
                result = `Congratulations, you chose correct! You won $${new Intl.NumberFormat('de-DE').format(won * 100000)} ($${new Intl.NumberFormat('de-DE').format((won - lost) * 100000)} more, because you changed boxes)!`;
                break;
            case Answer.DOESNT_MATTER:
                result = `💩 Poop! Of course it matters! You could have won $${new Intl.NumberFormat('de-DE').format(lost * 100000)} if you changed boxes, but now you only won ${new Intl.NumberFormat('de-DE').format(won * 100000)}! 💩`;
                break;

        }

        result = <div
            className={"result " + (answer === Answer.CHANGE_TO_THE_OTHER_BOX ? "win" : "lose")}>{result}</div>;
    }

    return <div className={"page"}>
        <div className={"page-title"}>Extended Monty Hall Challenge</div>
        <div className="page-content">
            <div className={"doors"}>
                {renderedBoxes}
            </div>
            <div className={"instructions-container"}>
                <div className={"instructions"}>
                    <div className={"instruction"}>There is a $100.000 💵 prize hidden in every row.
                    </div>
                    <div className={"instruction bold underline"}>Select one white box in every row.</div>
                </div>
                {step2}
                {step3}
                {result}
            </div>
        </div>
    </div>;
}

export default App;
