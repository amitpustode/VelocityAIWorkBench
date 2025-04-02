import os
from domain.logger import logger

def set_ollama_docker_url(url):
    if is_running_in_docker():
        logger.info(f"OLLAMA is running in docker")
        return update_server_name(url, get_host_ip())
    else:
        return url


def is_running_in_docker() -> bool:
    """Checks if the code is running inside a Docker container."""
    try:
        if os.path.exists("/.dockerenv"):
            return True
        with open("/proc/1/cgroup", "r") as f:
            return "docker" in f.read()
    except FileNotFoundError:
        return False


def update_server_name(url: str, new_server: str) -> str:
    """
    Replaces the server name in a URL with a new server name
    while preserving scheme and port.
    """
    scheme, _, rest = url.partition("://")
    host_and_port, _, path_and_more = rest.partition("/")
    host, _, port = host_and_port.partition(":")
    ollama_host_url = f"{scheme}://{new_server}:{port}"
    ollama_base_url = f"{scheme}://{new_server}:{port}/{path_and_more}"
    os.environ["OLLAMA_HOST"] = ollama_host_url
    logger.info(f"OLLAMA Host Docker URL: {ollama_host_url}")
    logger.info(f"OLLAMA Docker URL: {ollama_base_url}")
    return ollama_base_url


def get_host_ip():
    host_ip = os.getenv("HOST_IP")
    logger.info(f"Host IP: {host_ip}")
    return host_ip