import './App.css';

import React from 'react';
import { useState } from 'react';
import { UserFull } from '@uniscale-sdk/ActorCharacter-Messagethreads/sdk/UniscaleDemo/Account/Account/UserFull'
import { DispatcherSession } from '@uniscale-sdk/ActorCharacter-Messagethreads';
import { Welcome } from './account/Welcome';
import { Timeline } from './streams/Timeline';

interface AppProps {
  dispatcher: DispatcherSession
}

interface AppState {
  uiStage: 'Register' | 'Timeline' | 'DirectMessages'
  user: UserFull | undefined
}

export const App = (props: AppProps) => {
  const [state, setState] = useState<AppState>({
    uiStage: 'Register',
    user: undefined
  });

  return (
    <div className="App">
      { state.uiStage === 'Register' ?
        <Welcome
          dispatcher={props.dispatcher}
          onLogin={(user: UserFull) => {
            setState({...state, uiStage: 'Timeline', user: user})
          }}
        />:
        <div>
          <button onClick={() => setState({...state, uiStage: 'Timeline'})}>Timeline</button>
          <button onClick={() => setState({...state, uiStage: 'DirectMessages'})}>Direct messages</button>
          { state.uiStage === 'Timeline' ?
            <Timeline
              dispatcher={props.dispatcher}
              user={state.user as UserFull}
            />:
            <div /> }
        </div>
      }
    </div>
  );
}
