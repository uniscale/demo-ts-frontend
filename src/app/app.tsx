import './app.css'
import React, { FunctionComponent, createContext } from 'react'
import { useState } from 'react'
import { UserFull } from '@uniscale-sdk/ActorCharacter-Messagethreads/sdk/UniscaleDemo/Account/Account/UserFull'
import { DispatcherSession } from '@uniscale-sdk/ActorCharacter-Messagethreads'
import { Welcome } from './account/welcome'
import { Timeline } from './streams/timeline'
import { DirectMessages } from './streams/direct-messages'

interface IProps {
  dispatcher: DispatcherSession
}

interface AppState {
  uiStage: 'Register' | 'Timeline' | 'DirectMessages'
  user?: UserFull
  dispatcher: DispatcherSession
  setState: React.Dispatch<React.SetStateAction<AppState>>
}

const defaultAppState: AppState = {
  uiStage: 'Register',
  dispatcher: null as unknown as DispatcherSession,
  setState: (_value) => { throw new Error('not initialised') }
}

export const AppContext = createContext<AppState>(defaultAppState)

export const App: FunctionComponent<IProps> = ({ dispatcher }) => {
  const [state, setState] = useState<AppState>({ ...defaultAppState, dispatcher })

  return (
    <AppContext.Provider value={{ ...state, setState }}>
      <div className="app">
        {state.uiStage === 'Register' || state.user == null
          ? (
            <Welcome />
          ) : (
            <div className='content'>
              <div className="header">
                <div className='handle'>@{state.user.handle}</div>
                <div className='actions'>
                  <button onClick={() => setState({ ...state, uiStage: 'Timeline' })}>Timeline</button>
                  <button onClick={() => setState({ ...state, uiStage: 'DirectMessages' })}>Direct messages</button>
                </div>
              </div>
              <div>
                {state.uiStage === 'Timeline' ?
                  <Timeline /> :
                  <DirectMessages />}
              </div>
            </div>
          )
        }
      </div>
    </AppContext.Provider>
  )
}
