import { StrictMode } from 'react';
import {createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App';
import { DispatcherSession, GatewayRequest, Platform, Result } from '@uniscale-sdk/ActorCharacter-Messagethreads';
import { registerAccountInterceptors } from './account/PrototypeFunctionality';
import { registerStreamsInterceptors } from './streams/PrototypeFunctionality';
import { Patterns as AccountPatterns } from '@uniscale-sdk/ActorCharacter-Messagethreads/sdk/UniscaleDemo/Account';
import { Patterns as StreamsPatterns } from '@uniscale-sdk/ActorCharacter-Messagethreads/sdk/UniscaleDemo/Messages';
import axios from 'axios';

const initializeApp = async (): Promise<DispatcherSession> => {
  const session = await Platform.builder()
    .withInterceptors(i => {
      // Mock interceptors for prototyping. If you want to try out the functionality
      // as a frontend mock just un-comment these two lines and the mock
      // interceptors will take priority over the pattern interceptors below
      // registerAccountInterceptors(i)
      // registerStreamsInterceptors(i)

      // Real interceptors calling the service. We use a pattern interceptor to
      // intercept all features defined below that pattern in the model.
      i.interceptPattern(AccountPatterns.pattern, async (input, ctx) => {
          const headers = { 'Content-Type': 'application/json' };
          // To call the feature we call a POST method on the right URL
          // and pass it a serialized GatewayRequest as define in the SDK
          const response = await axios.post(
            "http://localhost:5298/api/service-to-module/" + ctx.featureId, 
            GatewayRequest.from(input, ctx), 
            { headers }
          );
          // The response needs to be serialized into the Result class
          return Result.fromJson(response.data)
        }
      )
      i.interceptPattern(StreamsPatterns.pattern, async (input, ctx) => {
          const headers = { 'Content-Type': 'application/json' };
          // To call the feature we call a POST method on the right URL
          // and pass it a serialized GatewayRequest as define in the SDK
          const response = await axios.post(
            "http://localhost:5192/api/service-to-module/" + ctx.featureId, 
            GatewayRequest.from(input, ctx), 
            { headers }
          );
          // The response needs to be serialized into the Result class
          return Result.fromJson(response.data)
        }
      )
    })
    .build()
  // We will acquire a DispatcherSession by calling asSolution using our
  // solution identifier. When we have the dispatcher session we are ready
  // to start calling our features.
  return session
    .asSolution('fea57070-a9dc-4018-b74d-e5c07491972b')
    .withLocale("en-GB")
    .withDataTenant("Customer 1 data tenant")
}

// Wrap the bootstrapper function call in an async function
const runApp = async () => {
  try {
    // We need to initialize the PlatformSession so that we can get hold of the 
    // dispatcher that we can use to utilize the modeled functionality
    const dispatcher = await initializeApp(); // Call your asynchronous bootstrapper function
    const root = createRoot(document.getElementById('root') as HTMLElement);
    root.render(
      <StrictMode>
        <App dispatcher={dispatcher} />
      </StrictMode>
    )
  } catch (error) {
    console.error('Application failed to start:', error);
  }
};

runApp();
