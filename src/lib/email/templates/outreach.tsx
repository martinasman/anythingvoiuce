import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Text,
} from '@react-email/components'

interface OutreachEmailProps {
  businessName: string
  previewUrl: string
  openTrackingUrl: string
}

export function OutreachEmail({
  businessName,
  previewUrl,
  openTrackingUrl,
}: OutreachEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>En AI-receptionist för {businessName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={text}>Hej,</Text>

          <Text style={text}>
            Jag byggde en demo på hur en AI-receptionist skulle låta för {businessName}.
            30 sekunder att lyssna:
          </Text>

          <Text style={linkBlock}>
            <Link href={previewUrl} style={link}>
              {previewUrl}
            </Link>
          </Text>

          <Text style={text}>
            Ingen kostnad, inga förpliktelser.
          </Text>

          <Text style={signature}>
            /Martin
            <br />
            <span style={companyName}>Anything Labs</span>
          </Text>

          <Text style={footer}>
            ---
            <br />
            Vill du inte få fler mail?{' '}
            <Link href="#" style={footerLink}>
              Avregistrera dig här
            </Link>
          </Text>

          {/* Open tracking pixel */}
          <Img
            src={openTrackingUrl}
            width="1"
            height="1"
            alt=""
            style={{ display: 'none' }}
          />
        </Container>
      </Body>
    </Html>
  )
}

// Simple, minimal styles for plain text look
const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '32px 24px',
  maxWidth: '560px',
}

const text = {
  color: '#1a1a1a',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 16px 0',
}

const linkBlock = {
  color: '#1a1a1a',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '16px 0 24px 0',
}

const link = {
  color: '#0066cc',
  textDecoration: 'none',
}

const signature = {
  color: '#1a1a1a',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '24px 0 0 0',
}

const companyName = {
  color: '#666666',
}

const footer = {
  color: '#999999',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '32px 0 0 0',
}

const footerLink = {
  color: '#999999',
  textDecoration: 'underline',
}

export default OutreachEmail
