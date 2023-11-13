import { GetOrRegister } from "@uniscale-sdk/ActorCharacter-Messagethreads/sdk/UniscaleDemo/Account_1_0/Functionality/ServiceToModule/Account/Registration/ContinueToApplication";
import { FunctionComponent, useContext, useState } from "react";
import { AppContext } from "../app";
import './welcome.css'
import { BackendActionOutput, Result } from "@uniscale-sdk/ActorCharacter-Messagethreads";

export const Welcome: FunctionComponent = () => {
  const { dispatcher, setState } = useContext(AppContext)
  const [inputValue, setInputValue] = useState<string>('');

  const handleButtonClick = async () => {
    // By using the "with" function on the defined feature in the SDK we can
    // pass it through the dispatcher and get our result.
    const result = Result.fromJson(JSON.stringify(await dispatcher.request(GetOrRegister.with(inputValue)))) as Result<BackendActionOutput<GetOrRegister>>

    if (!result.success) {
      console.log(result.error?.details?.userError);
      return
    }
    setState(prev => ({
      ...prev,
      user: result.value,
      uiStage: 'Timeline',
    }))
  }

  return (
    <div className='welcome'>
      <div className='login'>
        <h3>Please enter your user handle</h3>
        <input
          type="text"
          placeholder="Enter your user handle..."
          value={inputValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setInputValue(e.target.value)
          }}
        />
        <button onClick={handleButtonClick}>Continue</button>
      </div>
    </div>
  )
}