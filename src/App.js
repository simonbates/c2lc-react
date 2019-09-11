// @flow

import React from 'react';
import EditorsSelect from './EditorsSelect';
import * as FeatureDetection from './FeatureDetection';
import Interpreter from './Interpreter';
import ProgramTextEditor from './ProgramTextEditor';
import TextSyntax from './TextSyntax';
import TurtleGraphics from './TurtleGraphics';
import Mic from './Mic';

type AppState = {
    program: Array<string>,
    programVer: number,
    numEditors: number
};

type AppContext = {
    bluetoothApiIsAvailable: boolean
};

export default class App extends React.Component<{}, AppState> {
    appContext: AppContext;
    interpreter: Interpreter;
    syntax: TextSyntax;
    turtleGraphicsRef: { current: null | TurtleGraphics };

    constructor(props: {}) {
        super(props);

        this.state = {
            program: ["forward", "left"],
            programVer: 1,
            numEditors: 1
        };

        this.appContext = {
            bluetoothApiIsAvailable: FeatureDetection.bluetoothApiIsAvailable()
        };

        this.interpreter = new Interpreter(
            {
                forward: () => {
                    if (this.turtleGraphicsRef.current !== null) {
                        this.turtleGraphicsRef.current.forward(40);
                    }
                },
                left: () => {
                    if (this.turtleGraphicsRef.current !== null) {
                        this.turtleGraphicsRef.current.turnLeft(90);
                    }
                },
                right: () => {
                    if (this.turtleGraphicsRef.current !== null) {
                        this.turtleGraphicsRef.current.turnRight(90);
                    }
                }
            }
        );

        this.syntax = new TextSyntax();

        this.turtleGraphicsRef = React.createRef<TurtleGraphics>();

        this.handleProgramChange = this.handleProgramChange.bind(this);
        this.handleNumEditorsChange = this.handleNumEditorsChange.bind(this);
        this.handleClickRun = this.handleClickRun.bind(this);
        this.handleClickHome = this.handleClickHome.bind(this);
        this.handleClickClear = this.handleClickClear.bind(this);
        this.handleDeviceInput = this.handleDeviceInput.bind(this);
        this.voiceCancle = this.voiceCancle.bind(this);
        this.voiceDeleteAll = this.voiceDeleteAll.bind(this);
    }

    handleProgramChange: (Array<string>) => void;
    handleProgramChange(program: Array<string>) {
        this.setState((state) => {
            return {
                program: program,
                programVer: state.programVer + 1
            }
        });
    }

    handleNumEditorsChange: (number) => void;
    handleNumEditorsChange(numEditors: number) {
        this.setState({
            numEditors: numEditors
        });
    }

    handleClickRun: () => void;
    handleClickRun() {
        this.interpreter.run(this.state.program);
    }

    handleClickHome: () => void;
    handleClickHome() {
        if (this.turtleGraphicsRef.current !== null) {
            this.turtleGraphicsRef.current.home();
        }
    }

    handleClickClear: () => void;
    handleClickClear() {
        if (this.turtleGraphicsRef.current !== null) {
            this.turtleGraphicsRef.current.clear();
        }
    }

    //External input related function

    handleDeviceInput = voice => {
        let updatedProgram = this.state.program;
        updatedProgram.push(voice);
        this.setState({
            program: updatedProgram
        });
        this.handleProgramChange(updatedProgram);
    };

    voiceCancle() {
        let updatedProgram = this.state.program;
        updatedProgram.pop();
        this.setState({
            program: updatedProgram
        });
        this.handleProgramChange(updatedProgram);
    }

    voiceDeleteAll() {
        this.setState({
            program: []
        })
        this.handleProgramChange(this.state.program);
    }

    render() {
        return (
            <div>
                {[...Array(this.state.numEditors)].map((x, i) => {
                    return <ProgramTextEditor
                        program={ this.state.program }
                        programVer={ this.state.programVer }
                        syntax={ this.syntax }
                        onChange={ this.handleProgramChange }
                        key={ i } />
                })}
                <EditorsSelect
                    numEditors={ this.state.numEditors }
                    onChange={ this.handleNumEditorsChange } />
                <div className='c2lc-graphics'>
                    <TurtleGraphics ref={this.turtleGraphicsRef} />
                </div>
                <button onClick={ this.handleClickRun }>Run</button>
                <button onClick={ this.handleClickHome }>Home</button>
                <button onClick={ this.handleClickClear }>Clear</button>
                <div>
                    {this.appContext.bluetoothApiIsAvailable ? (
                        <p>Bluetooth available</p>
                    ) : (
                        <p>Bluetooth not available</p>
                    )}
                </div>
                <Mic 
                    voiceInput={ this.handleDeviceInput }
                    run = { this.handleClickRun } 
                    cancle = { this.voiceCancle }
                    home = { this.handleClickHome }
                    clear = { this.handleClickClear }
                    deleteAll = { this.voiceDeleteAll }
                />
            </div>
        );
    }
}
