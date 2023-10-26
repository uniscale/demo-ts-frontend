import { Empty, MessageFull } from "@uniscale-sdk/ActorCharacter-Messagethreads/sdk/UniscaleDemo/Messages/Messages"
import { GetMessageList } from "@uniscale-sdk/ActorCharacter-Messagethreads/sdk/UniscaleDemo/Messages_1_0/Functionality/ServiceToModule/Messages/Timeline/ListMessages"
import { SendMessage } from "@uniscale-sdk/ActorCharacter-Messagethreads/sdk/UniscaleDemo/Messages_1_0/Functionality/ServiceToModule/Messages/Timeline/SendMessage"
import { UserFull } from "@uniscale-sdk/ActorCharacter-Messagethreads/sdk/UniscaleDemo/Account/Account"
import { LookupUsers } from "@uniscale-sdk/ActorCharacter-Messagethreads/sdk/UniscaleDemo/Account_1_0/Functionality/ServiceToModule/Account/GetUsers/QuickLookup"
import { FunctionComponent, useContext, useState } from "react"
import { AppContext } from "../app"
import './streams.css'
import { BackendActionOutput, Result } from "@uniscale-sdk/ActorCharacter-Messagethreads"
import { createAvatar } from "@dicebear/core"
import { thumbs } from "@dicebear/collection"


interface MessageProps {
  message: MessageFull,
  user: UserFull
}

const Message = (props: MessageProps) => {
  const avatar = createAvatar(thumbs, {
    seed: props.user.handle
  })

  return (
    <div className="message">
      <div>
        <div className="avatar" dangerouslySetInnerHTML={{ __html: avatar.toString() }} />
      </div>
      <div>
        <div className="handle">@{props.user.handle}</div>
        <div className="message-content">{props.message.message}</div>
      </div>
    </div>
  )
}

interface MessageResults {
  messages: MessageFull[],
  users: UserFull[]
}

export const Timeline: FunctionComponent = () => {
  const { dispatcher, user } = useContext(AppContext)
  const [initialized, setInitialized] = useState(false)
  const [messages, setMessages] = useState<MessageResults>({ messages: [], users: [] })
  const [messageInput, setMessageInput] = useState<string>('')

  const getMessages = async () => {
    // By using the "with" function on the defined feature in the SDK we can
    // pass it through the dispatcher and get our result.
    const result = Result.fromJson(JSON.stringify(
      await dispatcher.request(GetMessageList.with(new Empty()))
    )) as Result<BackendActionOutput<GetMessageList>>

    if (!result.success) {
      console.log(result.error?.details?.userError || result.error?.details?.technicalError)
      return
    }

    // By using the "with" function on the defined feature in the SDK we can
    // pass it through the dispatcher and get our result.
    const usersResult = Result.fromJson(JSON.stringify(
      await dispatcher.request(LookupUsers.with(
        (result.value as MessageFull[]).map(u => u.created?.by as string)
      ))
    )) as Result<BackendActionOutput<LookupUsers>>

    if (!usersResult.success) {
      console.log(result.error?.details?.userError || result.error?.details?.technicalError)
      return
    }

    setMessages({
      messages: result.value as MessageFull[],
      users: usersResult.value as UserFull[]
    })
  }

  const sendMessage = async (msg: string) => {
    if (!user) return

    // By using the "with" function on the defined feature in the SDK we can
    // pass it through the dispatcher and get our result.
    const result = Result.fromJson(JSON.stringify(
      await dispatcher.request(SendMessage.with({
        by: user.userIdentifier,
        message: msg
      }))
    )) as Result<BackendActionOutput<SendMessage>>

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
      key={m.messageIdentifier}
      message={m}
      user={messages.users.find(u => u.userIdentifier === m.created?.by) as UserFull}
    />))

  return (
    <div style={{ height: '100%' }}>
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
          <button onClick={() => sendMessage(messageInput)}>Send</button>
        </div>
      </div>
      <div style={{ overflow: 'scroll', height: 'calc(100vh - 239px)' }}>
        {messageComponents}
      </div>
    </div>
  )
}
