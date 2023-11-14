import { DirectMessageFull } from "@uniscale-sdk/ActorCharacter-Messagethreads/sdk/UniscaleDemo/Messages/Messages"
import { UserFull } from "@uniscale-sdk/ActorCharacter-Messagethreads/sdk/UniscaleDemo/Account/Account"
import { LookupUsers } from "@uniscale-sdk/ActorCharacter-Messagethreads/sdk/UniscaleDemo/Account_1_0/Functionality/ServiceToModule/Account/GetUsers/QuickLookup"
import { FunctionComponent, useContext, useState } from "react"
import { AppContext } from "../app"
import './streams.css'
import { GetDirectMessageList } from "@uniscale-sdk/ActorCharacter-Messagethreads/sdk/UniscaleDemo/Messages_1_0/Functionality/ServiceToModule/Messages/DirectMessages/ListDirectMessages"
import { SendDirectMessage } from "@uniscale-sdk/ActorCharacter-Messagethreads/sdk/UniscaleDemo/Messages_1_0/Functionality/ServiceToModule/Messages/DirectMessages/SendingANewDirectMessage"

interface MessageProps {
  message: DirectMessageFull,
  user: UserFull
}

const Message = (props: MessageProps) => {
  return (
    <div className="message">
      <div>
        <div className="avatar" />
      </div>
      <div>
        <div className="handle">@{props.user.handle}</div>
        <div className="message-content">{props.message.message}</div>
      </div>
    </div>
  )
}

interface MessageResults {
  messages: DirectMessageFull[],
  users: UserFull[]
}

export const DirectMessages: FunctionComponent = () => {
  const { dispatcher, user } = useContext(AppContext)
  const [initialized, setInitialized] = useState(false)
  const [messages, setMessages] = useState<MessageResults>({ messages: [], users: [] })
  const [recipient, setRecipient] = useState<string>('')
  const [messageInput, setMessageInput] = useState<string>('')

  const getMessages = async () => {
    // By using the "with" function on the defined feature in the SDK we can
    // pass it through the dispatcher and get our result.
    const result = await dispatcher.request(GetDirectMessageList.with(user?.userIdentifier))
    if (!result.success) {
      console.log(result.error?.details?.userError || result.error?.details?.technicalError)
      return
    }

    // By using the "with" function on the defined feature in the SDK we can
    // pass it through the dispatcher and get our result.
    const usersResult = await dispatcher.request(LookupUsers.with((result.value as DirectMessageFull[]).map(u => u.created?.by as string)))
    if (!usersResult.success) {
      console.log(result.error?.details?.userError || result.error?.details?.technicalError)
      return
    }

    setMessages({
      messages: result.value as DirectMessageFull[],
      users: usersResult.value as UserFull[]
    })
  }

  const sendMessage = async (msg: string) => {
    if (!user) return

    // By using the "with" function on the defined feature in the SDK we can
    // pass it through the dispatcher and get our result.
    const result = await dispatcher.request(SendDirectMessage.with({
        by: user.userIdentifier,
        receiver: recipient,
        message: msg,
      }))

    if (!result.success) {
      console.log(result.error?.details?.userError || result.error?.details?.technicalError)
    }
    setMessageInput('')
    getMessages()
  }

  if (!initialized) {
    getMessages()
    setInitialized(true)
  }

  const messageComponents = messages.messages
    .map(m => (<Message
      key={m.directMessageIdentifier}
      message={m}
      user={messages.users.find(u => u.userIdentifier === m.created?.by) as UserFull}
    />))

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <textarea
          className="message-input"
          value={messageInput}
          placeholder="Enter a message here..."
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setMessageInput(e.target.value)
          }}
        />
        <div className="message-tools">
          <select onChange={(e) => setRecipient(e.target.value)}>
            {messages.users.sort((a, b) => (a?.handle || '').localeCompare((b?.handle || ''))).map(u => (
              <option value={u.userIdentifier}>{u.handle}</option>
            ))}
          </select>
          <button onClick={() => sendMessage(messageInput)}>Send</button>
        </div>
      </div>
      <div>
        {messageComponents}
      </div>
    </div>
  )
}
