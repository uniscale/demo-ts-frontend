import { DispatcherSession } from "@uniscale-sdk/ActorCharacter-Messagethreads";
import { UserFull } from "@uniscale-sdk/ActorCharacter-Messagethreads/sdk/UniscaleDemo/Account/Account";
import { GetOrRegister } from "@uniscale-sdk/ActorCharacter-Messagethreads/sdk/UniscaleDemo/Account_1_0/Functionality/ServiceToModule/Account/Registration/ContinueToApplication";
import { useState } from "react";

interface WelcomeProps {
  dispatcher: DispatcherSession
  onLogin: (use: UserFull) => void
}

export const Welcome = (props: WelcomeProps) => {
  const [inputValue, setInputValue] = useState<string>('');

  const handleButtonClick = async () => {
    // By using the "with" function on the defined feature in the SDK we can
    // pass it through the dispatcher and get our result.
    var result = await props.dispatcher.request(GetOrRegister.with(inputValue))
    if (!result.success) {
      console.log(result.error?.details?.userError);
      return
    }
    props.onLogin(result.value as UserFull)
  }
  
  return (
   <div>
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
  )
}