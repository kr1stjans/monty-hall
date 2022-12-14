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
    const [answer, setAnswer] = React.useState<Answer | undefined>(undefined);
    const [rowsCount, setRowsCount] = React.useState<number>(10);
    const [boxState, setBoxState] = React.useState<BoxRow[]>([]);

    React.useEffect(() => {
        let initialBoxState = [];
        for (let i = 0; i < rowsCount; i++) {
            initialBoxState.push(new BoxRow(Math.floor(Math.random() * 3)));
        }
        setBoxState(initialBoxState);
    }, [rowsCount]);

    const selectBox = (boxRow: number, selectedIndex: number) => {
        if (boxState[boxRow].emptyBoxIndex === undefined) {
            const newBoxState = [...boxState];
            newBoxState[boxRow].selectedIndex = newBoxState[boxRow].selectedIndex === selectedIndex ? undefined : selectedIndex;
            setBoxState(newBoxState);
        }
    }

    let boxesInAllRowsSelected = true;
    let allEmptyBoxesOpened = true;

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

    const selectAnswer = (newAnswer: Answer) => {
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

    const openOneEmptyBox = () => {
        if (!allEmptyBoxesOpened) {
            let newBoxState = [...boxState];

            for (let rowIndex = 0; rowIndex < newBoxState.length; rowIndex++) {
                newBoxState[rowIndex].emptyBoxIndex = newBoxState[rowIndex].prizeIndex;

                while (newBoxState[rowIndex].emptyBoxIndex === newBoxState[rowIndex].selectedIndex || newBoxState[rowIndex].emptyBoxIndex === newBoxState[rowIndex].prizeIndex) {
                    newBoxState[rowIndex].emptyBoxIndex = Math.floor(Math.random() * 3);
                }
            }

            setBoxState(newBoxState);
        }
    }

    let step2 = boxesInAllRowsSelected ?
        <div className={"instructions"}>
            <div className={"instruction"}>So far your odds of winning are completely random.</div>
            <div className={"instruction bold underline"}>To make this challenge easier for you, we will remove one empty box (in every row).</div>
            <div className={"question-option " + (allEmptyBoxesOpened ? "disabled" : "")}
                 onClick={() => openOneEmptyBox()}>Click to remove one empty box in every row
            </div>
        </div> : <></>;

    let step3 = allEmptyBoxesOpened ? <div className={"instructions"}>
        <div className={"instruction"}>
            You are now given a choice.
        </div>
        <div className={"instruction bold underline"}>
            Would you like to change your selected box to the other remaining box (in every row)?
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
            case Answer.DOESNT_MATTER:
            case Answer.KEEP_THE_SAME:
                if (won >= lost) {
                    result = `You got lucky and won $${new Intl.NumberFormat('de-DE').format(won * 100000)}, however you are statistically 33% less likely to win, if you keep the same boxes!`;
                } else {
                    result = `💩 Poop, you should have changed to the other boxes! You could have won $${new Intl.NumberFormat('de-DE').format(lost * 100000)} if you changed boxes, but now you only won ${new Intl.NumberFormat('de-DE').format(won * 100000)}! 💩`;
                }
                break;
            case Answer.CHANGE_TO_THE_OTHER_BOX:
                if (won <= lost) {
                    result = `Congratulations, you chose correct! You are statistically 33% more likely to win if you change the boxes, however in this specific small sample size (${rowsCount} rows) the opposite happened. You won $${new Intl.NumberFormat('de-DE').format(won * 100000)}.`;
                } else {
                    result = `Congratulations, you chose correct! You won $${new Intl.NumberFormat('de-DE').format(won * 100000)} ($${new Intl.NumberFormat('de-DE').format((won - lost) * 100000)} more, because you changed boxes)!`;
                }
                break;
        }

        result = <>
            <div
                className={"result " + (answer === Answer.CHANGE_TO_THE_OTHER_BOX ? "win" : "lose")}>{result} Try to increase the number of rows at the top of the page.</div>
            <div className={"instructions center"}>
                <a target={"_blank"} href={"https://en.wikipedia.org/wiki/Monty_Hall_problem"}
                   rel="noreferrer" className={"instruction bold underline"}>Read
                    why on Wikipedia</a>
            </div>
        </>;
    }

    const random = () => {
        if (!allEmptyBoxesOpened) {
            let newBoxState = [...boxState];

            for (let rowIndex = 0; rowIndex < newBoxState.length; rowIndex++) {
                newBoxState[rowIndex].selectedIndex = Math.floor(Math.random() * 3);
            }

            setBoxState(newBoxState);
        }
    }

    const updateRowsCount = (event: any) => {
        setAnswer(undefined);
        setRowsCount(parseInt(event.target.value));
    }

    return <div className={"page"}>
        <div className={"page-title"}>Extended Monty Hall Challenge</div>
        <div className="page-content">
            <div className={"doors"}>
                {renderedBoxes}
            </div>
            <div className={"instructions-container"}>
                <div className={"instructions"}>
                    <div className={"instruction"}>There is a $100.000 💵 prize hidden in every row.</div>
                    <div className={"instruction"}>
                        <span>Number of rows:</span>
                        <select onChange={(e) => updateRowsCount(e)} value={rowsCount}>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            <option value={500}>500</option>
                            <option value={1000}>1000</option>
                        </select></div>
                    <div className={"instruction bold"}>Select one white box in every row</div>
                    <div className={"instruction bold hoverable"} onClick={() => random()}>or click here to select
                        randomly.
                    </div>
                </div>
                {step2}
                {step3}
                {result}
            </div>
        </div>
    </div>;
}

export default App;
