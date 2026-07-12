import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

export type WelcomeEmailProps = {
  name: string
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to VibeSphere — connect, share, and discover events</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Welcome to VibeSphere, {name} 👋</Heading>
          <Section>
            <Text style={text}>
              Thanks for joining. VibeSphere is where you connect with people, share moments, and
              discover events happening around you.
            </Text>
            <Text style={text}>
              Head to your feed to make your first post, or explore events to find something to
              join.
            </Text>
            <Text style={text}>See you around,</Text>
            <Text style={text}>— The VibeSphere team</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default WelcomeEmail

const body = {
  backgroundColor: '#f4f4f5',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '32px',
  maxWidth: '480px',
  borderRadius: '8px',
}

const heading = {
  fontSize: '22px',
  fontWeight: 600 as const,
  color: '#18181b',
}

const text = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#3f3f46',
}
