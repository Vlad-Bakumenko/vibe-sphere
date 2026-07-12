import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Column,
  Section,
  Text,
} from '@react-email/components'

export type BookingConfirmationEmailProps = {
  name: string
  eventTitle: string
  eventDate: string
  eventLocation: string
}

export function BookingConfirmationEmail({
  name,
  eventTitle,
  eventDate,
  eventLocation,
}: BookingConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your ticket for {eventTitle} is confirmed</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>You&apos;re going! 🎉</Heading>
          <Text style={text}>
            Hi {name}, your ticket purchase is confirmed. Here are the details:
          </Text>

          <Section style={card}>
            <Text style={eventName}>{eventTitle}</Text>
            <Hr style={hr} />
            <Row style={detailRow}>
              <Column style={label}>When</Column>
              <Column style={value}>{eventDate}</Column>
            </Row>
            <Row style={detailRow}>
              <Column style={label}>Where</Column>
              <Column style={value}>{eventLocation}</Column>
            </Row>
          </Section>

          <Text style={text}>
            You can view the event and manage your attendance any time from VibeSphere.
          </Text>
          <Text style={text}>— The VibeSphere team</Text>
        </Container>
      </Body>
    </Html>
  )
}

export default BookingConfirmationEmail

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

const card = {
  backgroundColor: '#fafafa',
  border: '1px solid #e4e4e7',
  borderRadius: '8px',
  padding: '20px',
  margin: '16px 0',
}

const eventName = {
  fontSize: '17px',
  fontWeight: 600 as const,
  color: '#18181b',
  margin: '0',
}

const hr = {
  borderColor: '#e4e4e7',
  margin: '12px 0',
}

const detailRow = {
  marginBottom: '8px',
}

const label = {
  fontSize: '13px',
  color: '#71717a',
  width: '64px',
}

const value = {
  fontSize: '14px',
  color: '#18181b',
}
