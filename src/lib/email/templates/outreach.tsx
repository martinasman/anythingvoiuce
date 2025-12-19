import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
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
      <Preview>
        Vi har byggt en AI-receptionist speciellt för {businessName}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logoText}>Anything Labs</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={heading}>
              Hej!
            </Heading>

            <Text style={paragraph}>
              Vi har byggt en AI-receptionist speciellt anpassad för{' '}
              <strong>{businessName}</strong>.
            </Text>

            <Text style={paragraph}>
              Den kan:
            </Text>

            <Section style={featureList}>
              <Text style={featureItem}>
                <span style={checkmark}>✓</span> Svara på kundsamtal dygnet runt
              </Text>
              <Text style={featureItem}>
                <span style={checkmark}>✓</span> Boka tider automatiskt
              </Text>
              <Text style={featureItem}>
                <span style={checkmark}>✓</span> Besvara vanliga frågor om era tjänster
              </Text>
            </Section>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button style={button} href={previewUrl}>
                Lyssna på demo
              </Button>
            </Section>

            <Text style={paragraphSmall}>
              Demot tar bara 2 minuter och visar exakt hur den skulle låta för era kunder.
            </Text>

            <Hr style={divider} />

            <Text style={paragraph}>
              Intresserad av att veta mer? Svara på detta mail eller ring oss på{' '}
              <Link href="tel:+46XXXXXXXXX" style={link}>
                070-XXX XX XX
              </Link>
              .
            </Text>

            <Text style={signoff}>
              Med vänliga hälsningar,
              <br />
              <strong>Anything Labs</strong>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Anything Labs AB | Stockholm, Sverige
            </Text>
            <Text style={footerText}>
              <Link href="https://anythinglabs.net" style={footerLink}>
                anythinglabs.net
              </Link>
            </Text>
            <Text style={unsubscribe}>
              Vill du inte få fler mail?{' '}
              <Link href="#" style={footerLink}>
                Avregistrera dig här
              </Link>
            </Text>
          </Section>

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

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  maxWidth: '600px',
  borderRadius: '8px',
  overflow: 'hidden' as const,
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
}

const header = {
  backgroundColor: '#18181b',
  padding: '24px 32px',
}

const logoText = {
  color: '#ffffff',
  fontSize: '20px',
  fontWeight: '600' as const,
  margin: '0',
}

const content = {
  padding: '40px 32px',
}

const heading = {
  color: '#18181b',
  fontSize: '24px',
  fontWeight: '600' as const,
  margin: '0 0 24px 0',
}

const paragraph = {
  color: '#3f3f46',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 16px 0',
}

const paragraphSmall = {
  color: '#71717a',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '16px 0 0 0',
  textAlign: 'center' as const,
}

const featureList = {
  margin: '24px 0',
  padding: '0',
}

const featureItem = {
  color: '#3f3f46',
  fontSize: '16px',
  lineHeight: '32px',
  margin: '0',
}

const checkmark = {
  color: '#22c55e',
  marginRight: '8px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600' as const,
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '14px 32px',
  display: 'inline-block',
}

const divider = {
  borderColor: '#e4e4e7',
  margin: '32px 0',
}

const link = {
  color: '#2563eb',
  textDecoration: 'underline',
}

const signoff = {
  color: '#3f3f46',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '24px 0 0 0',
}

const footer = {
  backgroundColor: '#fafafa',
  padding: '24px 32px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#71717a',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '0 0 4px 0',
}

const footerLink = {
  color: '#71717a',
  textDecoration: 'underline',
}

const unsubscribe = {
  color: '#a1a1aa',
  fontSize: '11px',
  lineHeight: '18px',
  margin: '16px 0 0 0',
}

export default OutreachEmail
