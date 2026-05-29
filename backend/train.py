import pickle
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

def train_and_save_model():
    print("[Winston Train] Bootstrapping model training...")

    # High-quality synthetic training data representing distinct writing styles
    # Label 1 = Factual/Credible, Label 0 = Fake/Biased/Sensational
    training_data = [
        # --- FACTUAL / CREDIBLE NEWS (Label 1) ---
        ("Researchers at the National Institute of Health released a peer-reviewed study confirming that regular cardiovascular exercise reduces long-term cardiac disease rates by thirty percent. The study tracked ten thousand participants over a decade, adjusting for dietary factors and age, proving a definitive causal link between active lifestyles and heart longevity.", 1),
        ("The European Space Agency successfully launched its new atmospheric surveillance satellite from the French Guiana spaceport on Tuesday. According to official flight telemetry, the orbital device deployed its primary sensor array and has begun transmitting climate data to research centers in Geneva and Munich.", 1),
        ("The City Council approved a new zoning amendment on Thursday that allocates twelve percent of all upcoming residential developments for affordable housing. The ordinance, which goes into effect next month, was drafted after a six-month public review period involving urban planners, civil engineers, and local community representatives.", 1),
        ("A spokesperson for the World Health Organization announced that global vaccination rates for childhood illnesses have stabilized after a three-year decline. The organization's annual report indicates that coordinated public health campaigns in Sub-Saharan Africa and South Asia contributed significantly to the recovery.", 1),
        ("Retail sales rose by zero point four percent in April, matching analyst forecasts and suggesting steady consumer spending despite modest inflation pressure. The Department of Commerce reported that gains in electronics and online retail offset declines in gasoline sales and building materials.", 1),
        ("Geologists at the United States Geological Survey reported a magnitude four point two earthquake centered twelve miles northeast of Seattle. According to local emergency services, no casualties or structural damages have been reported, although tremors were felt across the metropolitan region.", 1),
        ("The Federal Reserve kept interest rates unchanged at its meeting on Wednesday, citing progress in lowering inflation but reiterating that further economic data is needed before rate cuts can be considered. Chairman Jerome Powell stated that the labor market remains resilient.", 1),
        ("The Supreme Court issued a unanimous decision upholding federal environmental standards on water purification, ruling that the Environmental Protection Agency has the statutory authority to regulate chemical runoffs in industrial waterways under the Clean Water Act.", 1),
        ("Renewable energy sources accounted for a record twenty-two percent of total electricity generation in the United States last year, according to a report published by the Energy Information Administration. Wind and solar installations drove the majority of the growth.", 1),
        ("Academics from Oxford University published a historical analysis detailing the economic transitions in post-war Europe. The textbook relies on extensive archival records from five different national banks, providing a comprehensive assessment of monetary policy.", 1),

        # --- SENSATIONAL / FAKE NEWS (Label 0) ---
        ("SHOCKING REVELATION! Doctors are panicking after a miracle natural herb was proven to completely cure all forms of diabetes in just twenty-four hours! The big pharmaceutical companies are desperately trying to ban this secret plant to protect their billion-dollar profits! Share this before it gets deleted!", 0),
        ("EXCLUSIVE: Unbelievable leaked documents expose the dark secret that the global elite are using high-frequency radio waves to control the minds of citizens in major cities! This secret project, code-named Project Omega, has been running for years and the mainstream media is completely silent! Wake up, sheeple!", 0),
        ("IT IS FINALLY PROVEN! A shocking video shows real alien spaceships hovering directly over the Pentagon last night! The military scrambled fighter jets but they were instantly deactivated by alien forcefields! The government is fabricating a weather balloon story to hide the absolute truth from the public!", 0),
        ("WARNING! A top doctor has exposed the terrifying truth about public tap water: it contains secret chemicals designed to keep the population submissive and lazy! He was immediately fired from his hospital, but his message is spreading online! Click here to buy the only filter that can save your family!", 0),
        ("ALERT: The stock market is guaranteed to collapse completely next Friday, wiping out all bank accounts and retirement funds! Insiders are secretly moving all their money into digital gold to prepare for the end of the financial system! Do not trust the banks, withdraw your cash now before it is too late!", 0),
        ("ANONYMOUS SOURCE EXPOSES: The recent major storm was not a natural disaster, it was completely created by a secret government weather control weapon! They targeted specific agricultural zones to destroy food supplies and force people into FEMA camps! Read the secret documents here!", 0),
        ("REVEALED: A famous scientist has admitted on his deathbed that global warming is a complete hoax invented by globalists to tax the air we breathe! There is zero scientific evidence that carbon emissions affect temperatures, and the entire climate agenda is a multi-trillion dollar scam!", 0),
        ("THIS IS CRAZY! A local man discovered a secret subterranean city under the subway tunnels containing ancient technology and gold! The police immediately sealed off the area and threatened to arrest anyone who speaks about it! The government is keeping our true history hidden!", 0),
        ("UNBELIEVABLE! You won't believe what this major political candidate did in secret! The media is covering up the shocking tape showing them accepting suitcases of cash from foreign spies! This is absolute treason, share this post to force an immediate investigation!", 0),
        ("MIRACLE HEALING! A secret mineral water found in a remote mountain cave has been proven to reverse aging and cure all joint pains permanently! Local residents live to be over one hundred and fifty years old! Big Pharma has blocked imports, but you can buy it directly from us today!", 0)
    ]

    # Add extra weight by repeating items to ensure solid coefficients
    texts = [item[0] for item in training_data] * 5
    labels = [item[1] for item in training_data] * 5

    # Initialize TF-IDF Vectorizer
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        stop_words='english',
        max_features=1000,
        sublinear_tf=True
    )
    
    # Fit and transform
    X = vectorizer.fit_transform(texts)
    y = labels

    # Fit Logistic Regression model
    model = LogisticRegression(C=1.0, random_state=42)
    model.fit(X, y)

    # Evaluate (on original train set just to check)
    train_acc = model.score(X, y)
    print(f"[Winston Train] Model trained successfully. Training Accuracy: {train_acc * 100:.2f}%")

    # Ensure model folder exists
    model_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
    os.makedirs(model_dir, exist_ok=True)

    # Save vectorizer and model
    vectorizer_path = os.path.join(model_dir, "vectorizer.pkl")
    model_path = os.path.join(model_dir, "model.pkl")

    with open(vectorizer_path, "wb") as f:
        pickle.dump(vectorizer, f)
    with open(model_path, "wb") as f:
        pickle.dump(model, f)

    print(f"[Winston Train] Model saved to {model_path}")
    print(f"[Winston Train] Vectorizer saved to {vectorizer_path}")

if __name__ == "__main__":
    train_and_save_model()
