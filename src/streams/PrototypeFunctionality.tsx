import { PlatformInterceptorBuilder } from "@uniscale-sdk/ActorCharacter-Messagethreads"
import { Patterns } from "@uniscale-sdk/ActorCharacter-Messagethreads/sdk/UniscaleDemo/Messages"
import { MessageFull, DirectMessageFull } from "@uniscale-sdk/ActorCharacter-Messagethreads/sdk/UniscaleDemo/Messages/Messages"

const messages = new Map<string,MessageFull>()
const directMessages = new Map<string,DirectMessageFull>()

export const registerStreamsInterceptors = (builder: PlatformInterceptorBuilder) => {
    // In here we define all our prototyping mocks to simulate implemented functionaly that we want
    // to use while we build our frontend through high speed iterations.
    //
    // In this case have have defined a static map of users that we utilise
    // when implementing the features. As a result the applicatin will reset
    // every time you reload. If you wanted a more complex scenario you could
    // use the browsers local storage so that your prototype data can be 
    // persisted between reloads
    builder
        .interceptMessage(
            // We can use the generated pattern structures in the generated SDK to 
            // find the functionality we want to intercept. By using the
            // allRequestUsages we will intercept a call to any of the use case flows
            // that contains this feature
            Patterns.messages.sendMessage.allMessageUsages,
            // From the generated pattern pattern structure we can also find helper
            // methods that we can use to implement the feature handler
            Patterns.messages.sendMessage.handleDirect((input, ctx) => {
                const msg: MessageFull = {
                    messageIdentifier: crypto.randomUUID(),
                    message: input.message,
                    created: {
                        by: input.by,
                        at: new Date()
                    }
                }
                messages.set(msg.messageIdentifier as string, msg)
            })
        )
        .interceptRequest(
            Patterns.messages.getMessageList.allRequestUsages,
            Patterns.messages.getMessageList.handleDirect((input, ctx) => {
                return Array.from(messages.values())
                    .reverse()
            })
        )
        .interceptMessage(
            Patterns.messages.sendDirectMessage.allMessageUsages,
            Patterns.messages.sendDirectMessage.handleDirect((input, ctx) => {
                const msg: DirectMessageFull = {
                    directMessageIdentifier: crypto.randomUUID(),
                    receiver: input.receiver,
                    message: input.message,
                    created: {
                        by: input.by,
                        at: new Date()
                    },
                    replies: undefined
                }
                directMessages.set(msg.directMessageIdentifier as string, msg)
            })
        )
        .interceptRequest(
            Patterns.messages.getDirectMessageList.allRequestUsages,
            Patterns.messages.getDirectMessageList.handleDirect((input, ctx) => {
                return Array.from(directMessages.values())
            })
        )
        .interceptMessage(
            Patterns.messages.replyToDirectMessage.allMessageUsages,
            Patterns.messages.replyToDirectMessage.handleDirect((input, ctx) => {
                // Implement method here
            })
        )
}
