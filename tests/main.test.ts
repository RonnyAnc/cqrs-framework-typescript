import { Container, injectable } from 'inversify'
import 'reflect-metadata'

describe('Mediator', () => {
    it('should resolve request handler for a certain request', async () => {
        const myContainer = new Container()
        myContainer
            .bind<RequestHandler<TestRequest>>(TYPES.TestRequestHandler)
            .to(TestRequestHandler)
            .inSingletonScope()
        const mediator = new Mediator(myContainer)

        await mediator.Handle(new TestRequest())

        const testHandler = myContainer.get<RequestHandler<TestRequest>>(
            TYPES.TestRequestHandler
        ) as TestRequestHandler
        expect(testHandler.hasBeenCalledWithTestRequest).toBeTruthy()
    })

    class Mediator {
        constructor(private container: Container) {}

        public async Handle<T extends Request>(request: T): Promise<void> {
            const handler = this.container.get<RequestHandler<T>>(
                TYPES[`${request.name}Handler`]
            )
            await handler.Handle(request)
            return Promise.resolve()
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Request {
        get name(): string
    }

    class TestRequest implements Request {
        get name(): string {
            return 'TestRequest'
        }
    }

    interface RequestHandler<T extends Request> {
        get name(): string
        Handle(request: T): Promise<void>
    }

    @injectable()
    class TestRequestHandler implements RequestHandler<TestRequest> {
        get name(): string {
            return TestRequestHandler.name
        }
        public hasBeenCalledWithTestRequest = false

        Handle(request: TestRequest): Promise<void> {
            if (request instanceof TestRequest) {
                this.hasBeenCalledWithTestRequest = true
            }
            return Promise.resolve()
        }
    }

    const TYPES = {
        TestRequestHandler: 'TestRequestHandler'
    }
})
