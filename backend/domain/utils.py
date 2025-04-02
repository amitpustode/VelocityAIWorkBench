class Utils:
    max_token_length = 80000

    @staticmethod
    def clean_text(self, text: str) -> str:
            return " ".join(text.split())
