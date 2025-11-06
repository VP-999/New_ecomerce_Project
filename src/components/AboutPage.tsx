import type React from "react"

const AboutPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4 text-foreground">About TrendHive</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Welcome to TrendHive, your ultimate destination for modern fashion and timeless style. We believe that fashion
          is a way to express who you are without having to speak.
        </p>
      </div>
      <div className="max-w-4xl mx-auto mt-12 text-foreground space-y-6">
        <p>
          Founded in 2024, TrendHive started with a simple idea: to create a one-stop shop for high-quality, stylish,
          and affordable fashion. Our team of passionate designers and fashion enthusiasts travels the world to bring
          you the latest trends and a curated collection of wardrobe essentials.
        </p>
        <p>
          Our mission is to empower you to feel confident and stylish every day. We are committed to providing an
          exceptional online shopping experience, from the moment you land on our site to the moment your order arrives
          at your door. We focus on quality materials, impeccable craftsmanship, and sustainable practices.
        </p>
        <p>Thank you for being a part of our journey. We're excited to help you build a wardrobe you love.</p>
      </div>
    </div>
  )
}

export default AboutPage
